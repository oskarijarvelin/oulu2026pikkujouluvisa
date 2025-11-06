"use client";
import { cn } from "@/lib/utils";
import { useQuestionStore } from "@/store/quiz-store";
import Image from "next/image";
import { useState } from "react";
import Answer from "../atoms/answer";

type AnswersProps = {
  data: string[];
  handleAnswer: (questionId: number, answer: string) => void;
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

  const handleSelectAnswer = (answer: string) => {
    if (selectedAns) return; // Prevent changing answer after selection
    setSelectedAns(answer);
    handleAnswer(questionId, answer);

    // Auto advance to next question after a delay
    setTimeout(() => {
      if (questions.every((q) => q.userSelectedAnswer != null)) {
        onCompleteQuestions();
      } else {
        goNextQuestion();
        setSelectedAns("");
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
