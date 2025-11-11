import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Question, Quizz } from "@/lib/types";
import { fetchQuizzesFromFirebase } from "@/lib/firebase-service";

interface State {
  quizzes: Quizz[];
  questions: Question[];
  selectedQuizz: Quizz | null;
  currentQuestion: number;
  hasCompleteAll: boolean;
  score: number;
  selectQuizz: (quizz: Quizz) => void;
  fetchQuizzes: () => Promise<void>;
  selectAnswer: (questionId: number, selectedAnswer: string | string[], timeTakenMs?: number) => void;
  goNextQuestion: () => void;
  goPreviousQuestion: () => void;
  onCompleteQuestions: () => void;
  reset: () => void;
}

/**
 * API URL based on environment - used for fallback to static JSON
 */
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://oulu2026pikkujouluvisa.vercel.app/"
    : "http://localhost:3000/";

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 * Creates a shuffled copy without modifying the original array
 * @param arr - Array to shuffle
 * @returns Shuffled copy of the array
 */
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate localStorage key for storing question order
 * Format: order:{playerName}:{quizTitle}
 */
function makeOrderKey(playerKey: string, quizTitle: string) {
  return `order:${playerKey}:${quizTitle}`;
}

/**
 * Get the current player's key from localStorage
 * Replaces spaces with underscores for consistency
 * @returns Player key or 'guest' if not found
 */
function getPlayerKey() {
  if (typeof window === "undefined") return "guest";
  return (localStorage.getItem("playerName") || "guest").replace(/\s+/g, "_");
}

/**
 * Load saved question order from localStorage for a specific player and quiz
 * @returns Array of question IDs or null if not found/invalid
 */
function loadOrderIds(playerKey: string, quizTitle: string): number[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(makeOrderKey(playerKey, quizTitle));
    if (!raw) return null;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

/**
 * Save question order to localStorage for persistence across sessions
 */
function saveOrderIds(playerKey: string, quizTitle: string, ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(makeOrderKey(playerKey, quizTitle), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * Return questions in a persistent shuffled order for the current player.
 * - if stored order exists and matches current question set, use it
 * - otherwise shuffle once, persist order and return shuffled questions
 */
function getOrCreateShuffledQuestions<T extends { id: number }>(
  quizTitle: string,
  questions: T[]
): T[] {
  if (typeof window === "undefined") return questions.slice();

  const playerKey = getPlayerKey();
  const stored = loadOrderIds(playerKey, quizTitle);

  // Build map of id -> question for quick lookup
  const map = new Map<number, T>();
  questions.forEach((q) => map.set(q.id, q));

  if (stored && stored.length === questions.length && stored.every((id) => map.has(id))) {
    // Re-order according to stored ids
    return stored.map((id) => map.get(id)!) as T[];
  }

  // No valid stored order: shuffle and persist
  const shuffled = shuffle(questions);
  const ids = shuffled.map((q) => q.id);
  saveOrderIds(playerKey, quizTitle, ids);
  return shuffled;
}

/**
 * Calculate points based on time taken to answer:
 * - If time-based scoring is disabled, return 1.0 for correct, 0 for incorrect
 * - Otherwise use configurable thresholds:
 *   - <= fullPointsThreshold: 1.0 points (full points)
 *   - >= halfPointsThreshold: 0.5 points (half points)
 *   - Between thresholds: linear decrease with 0.1 point steps
 */
function calculatePointsFromTime(
  timeTakenMs: number, 
  isCorrect: boolean,
  timeBasedScoring: boolean = true,
  fullPointsThreshold: number = 5000,
  halfPointsThreshold: number = 10000
): number {
  if (!isCorrect) return 0;
  
  // If time-based scoring is disabled, always return 1.0 for correct answers
  if (!timeBasedScoring) {
    return 1.0;
  }
  
  if (timeTakenMs <= fullPointsThreshold) {
    return 1.0;
  } else if (timeTakenMs >= halfPointsThreshold) {
    return 0.5;
  } else {
    // Linear interpolation between thresholds
    const range = halfPointsThreshold - fullPointsThreshold;
    const offset = timeTakenMs - fullPointsThreshold;
    const points = 1.0 - ((offset / range) * 0.5);
    // Round to nearest 0.1 to ensure clean 0.1 point decreases
    return Math.round(points * 10) / 10;
  }
}

export const useQuestionStore = create<State>()(
  persist(
    (set, get) => {
      return {
        quizzes: [],
        questions: [],
        score: 0,
        selectedQuizz: null,
        currentQuestion: 0,
        hasCompleteAll: false,
        selectQuizz: (quizz: Quizz) => {
          set({ selectedQuizz: quizz, questions: quizz.questions });
        },
        fetchQuizzes: async () => {
          try {
            // Try to fetch from Firebase first
            try {
              const quizzes = await fetchQuizzesFromFirebase();
              if (quizzes && quizzes.length > 0) {
                set({ quizzes, hasCompleteAll: false }, false);
                return;
              }
            } catch (firebaseError) {
              console.log("Firebase fetch failed, falling back to static file:", firebaseError);
            }
            
            // Fallback to static JSON file
            const res = await fetch(`${API_URL}/data.json`);
            const json = await res.json();
            const quizzes = json.quizzes as Quizz[];
            set({ quizzes, hasCompleteAll: false }, false);
          } catch (error) {
            console.log(error);
          }
        },

        selectAnswer: (questionId: number, selectedAnswer: string | string[], timeTakenMs?: number) => {
          const { questions, selectedQuizz } = get();
          // Use structuredClone to clone the object
          const newQuestions = structuredClone(questions);
          // Find the question index
          const questionIndex = newQuestions.findIndex(
            (q) => q.id === questionId
          );
          // Get the question information
          const questionInfo = newQuestions[questionIndex];
          
          // Determine if the user selected the correct answer
          let isCorrectUserAnswer: boolean;
          
          if (Array.isArray(questionInfo.answer)) {
            // Multiple correct answers - check if user's selection matches exactly
            const correctAnswers = questionInfo.answer;
            const userAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [selectedAnswer];
            
            // Check if arrays have same length and contain same elements (order doesn't matter)
            isCorrectUserAnswer = 
              correctAnswers.length === userAnswers.length &&
              correctAnswers.every(ans => userAnswers.includes(ans)) &&
              userAnswers.every(ans => correctAnswers.includes(ans));
          } else {
            // Single correct answer
            const userAnswer = Array.isArray(selectedAnswer) ? selectedAnswer[0] : selectedAnswer;
            isCorrectUserAnswer = questionInfo.answer === userAnswer;
          }

          // Get quiz options for time-based scoring configuration
          const timeBasedScoring = selectedQuizz?.options?.timeBasedScoring ?? true;
          const fullPointsThreshold = selectedQuizz?.options?.fullPointsThreshold ?? 5000;
          const halfPointsThreshold = selectedQuizz?.options?.halfPointsThreshold ?? 10000;

          // Calculate points based on time taken (default to 0 if no time provided)
          const pointsEarned = calculatePointsFromTime(
            timeTakenMs || 0, 
            isCorrectUserAnswer,
            timeBasedScoring,
            fullPointsThreshold,
            halfPointsThreshold
          );

          // Update this information in the question copy
          newQuestions[questionIndex] = {
            ...questionInfo,
            isCorrectUserAnswer,
            userSelectedAnswer: selectedAnswer,
            pointsEarned,
          };
          // Update the state
          set({ questions: newQuestions }, false);
        },
        onCompleteQuestions: () => {
          const { questions } = get();
          const score = questions.reduce((total, q) => total + (q.pointsEarned || 0), 0);

          set({ hasCompleteAll: true, currentQuestion: 0, score });
        },
        goNextQuestion: () => {
          const { currentQuestion, questions } = get();
          const nextQuestion = currentQuestion + 1;
          if (nextQuestion < questions.length) {
            set({ currentQuestion: nextQuestion }, false);
          }
        },

        goPreviousQuestion: () => {
          const { currentQuestion } = get();
          const previousQuestion = currentQuestion - 1;

          if (previousQuestion >= 0) {
            set({ currentQuestion: previousQuestion }, false);
          }
        },

        reset: () => {
          set(
            {
              currentQuestion: 0,
              questions: [],
              hasCompleteAll: false,
              selectedQuizz: null,
            },
            false
          );
        },
      };
    },
    {
      name: "visat",
    }
  )
);

// Example usage: where you currently set questions for a quiz, replace assignment with:
// questions: getOrCreateShuffledQuestions(quizTitle, loadedQuestions)
