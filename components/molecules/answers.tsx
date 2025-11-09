"use client";
import { useQuestionStore } from "@/store/quiz-store";
import { useState, useRef, useEffect } from "react";
import Answer from "../atoms/answer";
import { cn } from "@/lib/utils"; // added

type AnswersProps = {
  data: string[];
  handleAnswer: (questionId: number, answer: string, timeTakenMs?: number) => void;
  questionId: number;
  goNextQuestion: () => void;
};

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Answers = ({
  data,
  handleAnswer,
  questionId,
  goNextQuestion,
}: AnswersProps) => {
  const [selectedAns, setSelectedAns] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const waitTimeoutRef = useRef<number | null>(null);
  const { questions, onCompleteQuestions, selectedQuizz } = useQuestionStore();
  const currentQuestion = questions.find((q) => q.id === questionId);
  const isCorrectUserAnswer = currentQuestion?.isCorrectUserAnswer;
  const pointsEarned = currentQuestion?.pointsEarned;

  const answerLabels = ["A", "B", "C", "D"];

  // track when the question was shown
  const startTimeRef = useRef<number>(performance.now());

  // reset timer when questionId or data changes
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
    setSelectedAns("");
    // reset question shown timer
    startTimeRef.current = performance.now();
  }, [questionId]); // only run when question changes

  const handleSelectAnswer = (answer: string) => {
    if (selectedAns) return; // Prevent changing answer after selection
    const timeTakenMs = Math.max(0, performance.now() - startTimeRef.current);
    setSelectedAns(answer);
    handleAnswer(questionId, answer, timeTakenMs); // pass time to handler

    // start visual wait
    setIsWaiting(true);
    // clear any previous timeout
    if (waitTimeoutRef.current) {
      window.clearTimeout(waitTimeoutRef.current);
    }

    // Auto advance to next question after a delay (only if there is a next question)
    waitTimeoutRef.current = window.setTimeout(() => {
      const currentIndex = questions.findIndex((q) => q.id === questionId);
      if (currentIndex >= 0 && currentIndex < questions.length - 1) {
        // not the last question -> advance
        goNextQuestion();
        setSelectedAns("");
        startTimeRef.current = performance.now(); // reset for next question
        setIsWaiting(false);
      } else {
        // last question -> keep the same 1.5s wait visual, then complete quiz
        try {
          onCompleteQuestions();
        } catch (e) {
          /* ignore */
        }
        setIsWaiting(false);
      }
      waitTimeoutRef.current = null;
    }, 1500); // 1.5 second delay before moving to next question / showing score
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
              selectedAns
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
      <ul className="flex flex-col gap-y-4 justify-center w-full">
        {shuffledAnswers.map((answer, index) => (
          <Answer
            key={`${answer}-${index}`}
            answer={answer}
            selectedAns={selectedAns}
            isCorrectUserAnswer={isCorrectUserAnswer!}
            handleSelectAnswer={handleSelectAnswer}
            index={index}
            answerLabels={answerLabels}
            pointsEarned={pointsEarned}
          />
        ))}
      </ul>
      {/* Score count display under the options */}
      <div className="mt-4 flex items-center justify-center gap-2 text-yotaivas dark:text-valkoinen">
        <span className="text-lg font-semibold">Pisteet yhteensä:</span>
        <span className="text-2xl font-bold">
          {formatPoints(cumulativeScore)}/{maxScore}
        </span>
        {selectedAns && pointsEarned !== undefined && (
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
