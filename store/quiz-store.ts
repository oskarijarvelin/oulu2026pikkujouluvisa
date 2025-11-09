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
  selectAnswer: (questionId: number, selectedAnswer: string, timeTakenMs?: number) => void;
  goNextQuestion: () => void;
  goPreviousQuestion: () => void;
  onCompleteQuestions: () => void;
  reset: () => void;
}

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://oulu2026pikkujouluvisa.vercel.app/"
    : "http://localhost:3000/";

// helper: Fisher-Yates shuffle
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// localStorage keys: order:{playerKey}:{quizTitle}
function makeOrderKey(playerKey: string, quizTitle: string) {
  return `order:${playerKey}:${quizTitle}`;
}

function getPlayerKey() {
  if (typeof window === "undefined") return "guest";
  return (localStorage.getItem("playerName") || "guest").replace(/\s+/g, "_");
}

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

        selectAnswer: (questionId: number, selectedAnswer: string, timeTakenMs?: number) => {
          const { questions, selectedQuizz } = get();
          // usar el structuredClone para clonar el objeto
          const newQuestions = structuredClone(questions);
          // encontramos el índice de la pregunta
          const questionIndex = newQuestions.findIndex(
            (q) => q.id === questionId
          );
          // obtenemos la información de la pregunta
          const questionInfo = newQuestions[questionIndex];
          // averiguamos si el usuario ha seleccionado la respuesta correcta
          const isCorrectUserAnswer =
            questionInfo.answer === selectedAnswer;

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

          // cambiar esta información en la copia de la pregunta
          newQuestions[questionIndex] = {
            ...questionInfo,
            isCorrectUserAnswer,
            userSelectedAnswer: selectedAnswer,
            pointsEarned,
          };
          // actualizamos el estado
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
