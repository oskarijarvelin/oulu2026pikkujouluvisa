"use client";
import { cn } from "@/lib/utils";
import { useQuestionStore } from "@/store/quiz-store";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Answer from "../atoms/answer";

type AnswersProps = {
  data: string[];
  handleAnswer: (questionId: number, answer: string, timeTakenMs?: number) => void; // changed signature
  questionId: number;
  goNextQuestion: () => void;
};

const Answers = ({
  data,
  handleAnswer,
  questionId,
  goNextQuestion,
}: AnswersProps) => {
  const [selectedAns, setSelectedAns] = useState("");
  const { questions, onCompleteQuestions } = useQuestionStore();
  const isCorrectUserAnswer = questions.find(
    (q) => q.id === questionId
  )?.isCorrectUserAnswer;

  const answerLabels = ["A", "B", "C", "D"];

  // track when the question was shown
  const startTimeRef = useRef<number>(performance.now());

  // reset timer when questionId or data changes
  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [questionId, data]);

  const handleSelectAnswer = (answer: string) => {
    if (selectedAns) return; // Prevent changing answer after selection
    const timeTakenMs = Math.max(0, performance.now() - startTimeRef.current);
    setSelectedAns(answer);
    handleAnswer(questionId, answer, timeTakenMs); // pass time to handler

    // Auto advance to next question after a delay
    setTimeout(() => {
      if (questions.every((q) => q.userSelectedAnswer != null)) {
        onCompleteQuestions();
      } else {
        goNextQuestion();
        setSelectedAns("");
        startTimeRef.current = performance.now(); // reset for next question
      }
    }, 1500); // 1.5 second delay before moving to next question
  };

  return (
    <>
      <ul className="flex flex-col gap-y-4 justify-center w-full">
        {data.map((answer, index) => (
          <Answer
            key={answer}
            answer={answer}
            selectedAns={selectedAns}
            isCorrectUserAnswer={isCorrectUserAnswer!}
            handleSelectAnswer={handleSelectAnswer}
            index={index}
            answerLabels={answerLabels}
          />
        ))}
      </ul>
    </>
  );
};

export default Answers;
