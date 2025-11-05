"use client";
import Game from "@/components/molecules/game";
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import Score from "@/components/atoms/score";
import Subjects from "@/components/atoms/subjects";
import { useQuestionStore } from "@/store/quiz-store";
import { useEffect } from "react";
import { MotionDiv } from "@/components/animated/motion-div";
import { cn } from "@/lib/utils";

export default function Home() {
  const { fetchQuizzes, quizzes, selectedQuizz, hasCompleteAll, reset } =
    useQuestionStore();

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <MaxWidthWrapper
      className={cn(
        selectedQuizz && "xl:place-content-center",
        "grid px-6 grid-cols-1 md:grid-cols-2 gap-10 xl:gap-20 lg:px-0 relative z-50 h-full"
      )}
    >
      {!selectedQuizz && (
        <>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center xs:gap-4 md:gap-10 lg:mt-28 xl:mt-0"
          >
            <h1 className="xs:text-4xl md:text-5xl font-normal text-yotaivas dark:text-valkoinen xl:text-6xl 2xl:text-6xl">
              Tämä on Oulu2026 <span className="font-bold uppercase">pikkujouluvisa</span>
            </h1>
            <p className="text-perameri italic dark:text-jakala xs:text-sm xl:text-xl">
              Valitse pikkujouluvisan aihealue
            </p>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-y-4 xl:gap-y-6 justify-center w-full"
          >
            <Subjects data={quizzes} />
          </MotionDiv>
        </>
      )}
      {selectedQuizz && hasCompleteAll === false && <Game />}
      {hasCompleteAll && (
        <>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center xs:gap-3 md:gap-6 h-full"
          >
            <h1 className="xs:text-4xl md:text-5xl font-normal text-yotaivas dark:text-valkoinen xl:text-6xl">
              Sait pisteitä
            </h1>
            <p className="xs:text-4xl md:text-5xl uppercase font-bold text-yotaivas dark:text-valkoinen xl:text-6xl">
              yhteensä
            </p>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-center gap-y-4"
          >
            <Score />
            <button
              className="w-full bg-perameri py-4 px-5 rounded-xl shadow-lg text-valkoinen font-semibold text-lg text-center"
              onClick={reset}
            >
              Pelaa uudestaan
            </button>
          </MotionDiv>
        </>
      )}
    </MaxWidthWrapper>
  );
}
