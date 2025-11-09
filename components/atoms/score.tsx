"use client";
import { backgroundColors, getLucideIcon } from "@/lib/utils";
import { useQuestionStore } from "@/store/quiz-store";
import Image from "next/image";
import { useEffect } from "react";
import { initFirebase } from "@/lib/firebase";
import { getDatabase, ref, runTransaction } from "firebase/database";

const Score = () => {
  const { selectedQuizz, score } = useQuestionStore();

  useEffect(() => {
    if (selectedQuizz && score !== undefined) {
      // Get existing scores from localStorage
      const existingScores = JSON.parse(localStorage.getItem("quizScores") || "{}");

      // Update scores for this quiz
      const quizScores = existingScores[selectedQuizz.title] || [];

      // get player name from localStorage (added) — fallback to "Unknown"
      const playerName = localStorage.getItem("playerName") || "Unknown";

      quizScores.push({
        score: score,
        total: selectedQuizz.questions.length,
        date: new Date().toISOString(),
        name: playerName, // added player name
      });

      // Save back to localStorage
      existingScores[selectedQuizz.title] = quizScores;
      localStorage.setItem("quizScores", JSON.stringify(existingScores));

      // Try to update Firebase Realtime Database leaderboard
      try {
        initFirebase();
        const db = getDatabase();
        // Use a safe key for the player (encode to avoid illegal path chars)
        const playerKey = encodeURIComponent(playerName);
        const playerRef = ref(db, `leaderboard/${playerKey}`);

        // Transaction: merge perQuiz best score, recompute total and playedCount
        runTransaction(playerRef, (current) => {
          const perQuiz = (current && current.perQuiz) ? { ...current.perQuiz } : {};
          const prev = typeof perQuiz[selectedQuizz.title] === "number" ? perQuiz[selectedQuizz.title] : 0;
          perQuiz[selectedQuizz.title] = Math.max(prev, score);

          const total = Object.values(perQuiz).reduce(
            (s: number, v: unknown) => s + (typeof v === "number" ? v : 0),
            0
          );
          const playedCount = Object.keys(perQuiz).length;

          return {
            name: playerName,
            perQuiz,
            total,
            playedCount,
            updatedAt: new Date().toISOString(),
          };
        }).catch((err) => {
          console.error("Failed to update Firebase leaderboard:", err);
        });
      } catch (e) {
        // Firebase not configured or init failed — ignore, localStorage already saved
        // console.warn("Firebase init failed, skipping leaderboard update");
      }
    }
  }, [selectedQuizz, score]);

  if (!selectedQuizz) return null;

  // Get historical scores for this quiz
  const quizScores = (JSON.parse(localStorage.getItem("quizScores") || "{}")[selectedQuizz.title] || []) as {
    score: number;
    total?: number;
    date?: string;
    name?: string;
  }[];
  const scores = quizScores.map((s) => s.score);

  // Determine which icon to use
  const useLucideIcon = selectedQuizz.options?.icon;
  const LucideIconComponent = useLucideIcon ? getLucideIcon(useLucideIcon) : null;
  const iconColor = selectedQuizz.options?.iconColor || "#000000";
  const iconBgColor = selectedQuizz.options?.iconBgColor || backgroundColors[selectedQuizz.title] || selectedQuizz.bgcolor;

  return (
    <div className="flex flex-col gap-4 bg-[#fff] dark:bg-slate p-10 rounded-xl">
      <div className="flex gap-x-2 items-center justify-center">
        <div
          className="xs:p-1 p-2 rounded-lg"
          style={{ backgroundColor: iconBgColor }}
        >
          {LucideIconComponent ? (
            <LucideIconComponent size={30} color={iconColor} strokeWidth={2} />
          ) : (
            <Image src={selectedQuizz.icon} alt="arrow" width={30} height={30} />
          )}
        </div>
        <p className="text-dark-blue dark:text-white font-bold xs:text-xl md:text-2xl">
          {selectedQuizz.title}
        </p>
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        <p className="text-dark-blue dark:text-white my-10 font-bold xs:text-5xl sm:text-5xl lg:text-9xl">
          {score.toFixed(1)}/{selectedQuizz.questions.length}
        </p>
      </div>
    </div>
  );
};

export default Score;
