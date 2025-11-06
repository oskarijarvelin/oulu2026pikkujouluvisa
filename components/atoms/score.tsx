"use client";
import { backgroundColors } from "@/lib/utils";
import { useQuestionStore } from "@/store/quiz-store";
import Image from "next/image";
import { useEffect } from "react";

const Score = () => {
  const { selectedQuizz, score } = useQuestionStore();

  useEffect(() => {
    if (selectedQuizz && score !== undefined) {
      // Get existing scores from localStorage
      const existingScores = JSON.parse(localStorage.getItem("quizScores") || "{}");

      // Update scores for this quiz
      const quizScores = existingScores[selectedQuizz.title] || [];
      quizScores.push({
        score: score,
        total: selectedQuizz.questions.length,
        date: new Date().toISOString(),
      });

      // Save back to localStorage
      existingScores[selectedQuizz.title] = quizScores;
      localStorage.setItem("quizScores", JSON.stringify(existingScores));
    }
  }, [selectedQuizz, score]);

  if (!selectedQuizz) return null;

  // Get historical scores for this quiz
  const quizScores = (JSON.parse(localStorage.getItem("quizScores") || "{}")[selectedQuizz.title] || []) as {
    score: number;
    total?: number;
    date?: string;
  }[];
  const scores = quizScores.map((s) => s.score);

  return (
    <div className="flex flex-col gap-4 bg-[#fff] dark:bg-slate p-10 rounded-xl">
      <div className="flex gap-x-2 items-center justify-center">
        <div
          className="xs:p-1 p-2 rounded-lg"
          style={{ backgroundColor: backgroundColors[selectedQuizz.title] }}
        >
          <Image src={selectedQuizz.icon} alt="arrow" width={30} height={30} />
        </div>
        <p className="text-dark-blue dark:text-white font-bold xs:text-xl md:text-2xl">
          {selectedQuizz.title}
        </p>
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        <p className="text-dark-blue dark:text-white my-10 font-bold xs:text-5xl sm:text-5xl lg:text-9xl">
          {score}/{selectedQuizz.questions.length}
        </p>
      </div>
    </div>
  );
};

export default Score;
