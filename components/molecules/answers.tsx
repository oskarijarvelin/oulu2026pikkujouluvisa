"use client";
import { useQuestionStore } from "@/store/quiz-store";
import { useState, useRef, useEffect } from "react";
import Answer from "../atoms/answer";
import { cn } from "@/lib/utils";

type AnswersProps = {
  /** Array of answer options to display */
  data: string[];
  /** Callback when user submits an answer */
  handleAnswer: (questionId: number, answer: string | string[], timeTakenMs?: number) => void;
  /** ID of the current question */
  questionId: number;
  /** Callback to advance to next question */
  goNextQuestion: () => void;
};

/**
 * Fisher-Yates shuffle algorithm for randomizing answer order
 * Ensures fair distribution and prevents answer pattern recognition
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
 * Answers component - Handles quiz answer selection and submission
 * Supports both single-select and multi-select questions
 * Includes timing mechanism for scoring and visual feedback
 */
const Answers = ({
  data,
  handleAnswer,
  questionId,
  goNextQuestion,
}: AnswersProps) => {
  const [selectedAns, setSelectedAns] = useState<string | string[]>("");
  const [isWaiting, setIsWaiting] = useState(false); // Visual feedback delay state
  const [isSubmitted, setIsSubmitted] = useState(false); // Prevent answer changes after submit
  const waitTimeoutRef = useRef<number | null>(null);
  const { questions, onCompleteQuestions, selectedQuizz } = useQuestionStore();
  const currentQuestion = questions.find((q) => q.id === questionId);
  const isCorrectUserAnswer = currentQuestion?.isCorrectUserAnswer;
  const pointsEarned = currentQuestion?.pointsEarned;
  
  // Determine if this question has multiple correct answers
  const isMultiAnswer = Array.isArray(currentQuestion?.answer) && currentQuestion.answer.length > 1;

  const answerLabels = ["A", "B", "C", "D"];

  // Track when the question was shown for time-based scoring
  const startTimeRef = useRef<number>(performance.now());

  // Reset timer when question changes
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [questionId, data]);

  // Watch questions store and call onCompleteQuestions when all answered.
  // Only complete if we're NOT currently waiting (to avoid racing with the 1.5s visual feedback)
  useEffect(() => {
    if (!isWaiting && questions.length > 0 && questions.every((q) => q.userSelectedAnswer != null)) {
      onCompleteQuestions();
    }
  }, [questions, onCompleteQuestions, isWaiting]);

  // Randomize order of answers once per question (when `questionId` changes)
  // keep shuffledAnswers in state so re-renders (e.g. selecting an answer)
  // do NOT reshuffle on every render — only when the questionId changes
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>(() => shuffle(data));

  useEffect(() => {
    setShuffledAnswers(shuffle(data));
    // clear previous selection when question changes
    setSelectedAns(isMultiAnswer ? [] : "");
    setIsSubmitted(false);
    // reset question shown timer
    startTimeRef.current = performance.now();
  }, [questionId, isMultiAnswer, data]); // only run when question changes

  /**
   * Handles answer selection for both single and multi-select questions
   * - Single-select: automatically submits and advances
   * - Multi-select: toggles selection, requires explicit submit
   */
  const handleSelectAnswer = (answer: string) => {
    if (isSubmitted) return; // Prevent changing answer after submission
    
    if (isMultiAnswer) {
      // Multi-select mode: toggle answer in/out of selection
      const currentSelections = Array.isArray(selectedAns) ? selectedAns : [];
      if (currentSelections.includes(answer)) {
        // Deselect
        setSelectedAns(currentSelections.filter(a => a !== answer));
      } else {
        // Select
        setSelectedAns([...currentSelections, answer]);
      }
    } else {
      // Single select mode - calculate time and auto submit
      const timeTakenMs = Math.max(0, performance.now() - startTimeRef.current);
      setSelectedAns(answer);
      setIsSubmitted(true);
      handleAnswer(questionId, answer, timeTakenMs);

      // Start visual feedback period (1.5s delay)
      // Defer setIsWaiting to next tick to allow store update to propagate
      setTimeout(() => {
        setIsWaiting(true);
      }, 0);
      if (waitTimeoutRef.current) {
        window.clearTimeout(waitTimeoutRef.current);
      }

      // Auto advance to next question after delay
      waitTimeoutRef.current = window.setTimeout(() => {
        const currentIndex = questions.findIndex((q) => q.id === questionId);
        if (currentIndex >= 0 && currentIndex < questions.length - 1) {
          // Not the last question - advance to next
          goNextQuestion();
          setSelectedAns("");
          setIsSubmitted(false);
          startTimeRef.current = performance.now();
          setIsWaiting(false);
        } else {
          // Last question - complete the quiz
          try {
            onCompleteQuestions();
          } catch (e) {
            /* ignore */
          }
          setIsWaiting(false);
        }
        waitTimeoutRef.current = null;
      }, 1500); // 1.5 second delay before moving to next question / showing score
    }
  };

  /**
   * Handles submission for multi-select questions
   * Called when user clicks the "Vastaa" (Submit) button
   */
  const handleSubmitMultiAnswer = () => {
    if (!Array.isArray(selectedAns) || selectedAns.length === 0) return;
    
    const timeTakenMs = Math.max(0, performance.now() - startTimeRef.current);
    setIsSubmitted(true);
    handleAnswer(questionId, selectedAns, timeTakenMs);
    
    // Start visual feedback period
    // Defer setIsWaiting to next tick to allow store update to propagate
    setTimeout(() => {
      setIsWaiting(true);
    }, 0);
    if (waitTimeoutRef.current) {
      window.clearTimeout(waitTimeoutRef.current);
    }

    waitTimeoutRef.current = window.setTimeout(() => {
      const currentIndex = questions.findIndex((q) => q.id === questionId);
      if (currentIndex >= 0 && currentIndex < questions.length - 1) {
        goNextQuestion();
        setSelectedAns([]);
        setIsSubmitted(false);
        startTimeRef.current = performance.now();
        setIsWaiting(false);
      } else {
        try {
          onCompleteQuestions();
        } catch (e) {
          /* ignore */
        }
        setIsWaiting(false);
      }
      waitTimeoutRef.current = null;
    }, 1500);
  };

  // clear timeout when question changes / component unmounts
  useEffect(() => {
    return () => {
      if (waitTimeoutRef.current) {
        window.clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = null;
      }
    };
  }, [questionId]);

  // Calculate cumulative score from all answered questions
  const cumulativeScore = questions.reduce((total, q) => {
    if (q.userSelectedAnswer != null && q.pointsEarned !== undefined) {
      return total + q.pointsEarned;
    }
    return total;
  }, 0);

  // Determine maximum possible score for this quiz (fallback to question count)
  const maxScore =
    selectedQuizz?.questions?.length ?? (questions ? questions.length : 0);

  function formatPoints(value: number) {
    if (!Number.isFinite(value)) return String(value);
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  
  return (
    <>
      {/* progress bar visualizing 1.5s wait after answering */}
      <div className="w-full mt-4">
        <div className="h-2 bg-valkoinen dark:bg-yotaivas rounded overflow-hidden">
          <div
            aria-hidden
            className={cn(
              "h-full",
              // choose color only when an answer was selected (selectedAns)
              (typeof selectedAns === 'string' ? selectedAns : selectedAns.length > 0)
                ? isCorrectUserAnswer === true
                  ? "bg-metsa"
                  : isCorrectUserAnswer === false
                  ? "bg-puolukka"
                  : "bg-perameri"
                : "bg-perameri"
            )}
            style={{
              width: isWaiting ? "100%" : "0%",
              transition: "width 1500ms linear",
            }}
          />
        </div>
      </div>
      {isMultiAnswer && !isSubmitted && (
        <div className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
          Valitse kaikki oikeat vastaukset ja paina &quot;Vastaa&quot;
        </div>
      )}
      <ul className="flex flex-col gap-y-4 justify-center w-full">
        {shuffledAnswers.map((answer, index) => {
          const isSelected = Array.isArray(selectedAns) 
            ? selectedAns.includes(answer)
            : selectedAns === answer;
          
          return (
            <Answer
              key={`${answer}-${index}`}
              answer={answer}
              selectedAns={isSelected ? answer : ""}
              isCorrectUserAnswer={isCorrectUserAnswer!}
              handleSelectAnswer={handleSelectAnswer}
              index={index}
              answerLabels={answerLabels}
              pointsEarned={pointsEarned}
              isMultiAnswer={isMultiAnswer}
              isSubmitted={isSubmitted}
            />
          );
        })}
      </ul>
      {/* Submit button for multi-answer questions */}
      {isMultiAnswer && !isSubmitted && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleSubmitMultiAnswer}
            disabled={!Array.isArray(selectedAns) || selectedAns.length === 0}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold text-lg transition-all",
              Array.isArray(selectedAns) && selectedAns.length > 0
                ? "bg-yotaivas hover:bg-perameri text-valkoinen"
                : "bg-harmaa text-gray-500 cursor-not-allowed"
            )}
          >
            Vastaa
          </button>
        </div>
      )}
      {/* Score count display under the options */}
      <div className="mt-4 flex items-center justify-center gap-2 text-yotaivas dark:text-valkoinen">
        <span className="text-lg font-semibold">Pisteet yhteensä:</span>
        <span className="text-2xl font-bold">
          {formatPoints(cumulativeScore)}/{maxScore}
        </span>
        {(typeof selectedAns === 'string' ? selectedAns : selectedAns.length > 0) && pointsEarned !== undefined && (
          <span
            className={cn(
              "text-lg font-bold ml-2",
              isCorrectUserAnswer ? "text-metsa" : "text-puolukka"
            )}
          >
            ({isCorrectUserAnswer ? "+" : ""}{formatPoints(pointsEarned)}p)
          </span>
        )}
      </div>
    </>
  );
};

export default Answers;
