"use client";
import Game from "@/components/molecules/game";
import MaxWidthWrapper from "@/components/atoms/max-width-wrapper";
import Link from "next/link";
import Score from "@/components/atoms/score";
import Subjects from "@/components/atoms/subjects";
import { useQuestionStore } from "@/store/quiz-store";
import { useEffect, useState } from "react";
import { MotionDiv } from "@/components/animated/motion-div";
import { cn } from "@/lib/utils";

type LeaderboardRow = {
  name: string;
  total: number;
  playedCount: number;
  perQuiz: Record<string, number>;
};

export default function Home() {
  const { fetchQuizzes, quizzes, selectedQuizz, hasCompleteAll, reset } =
    useQuestionStore();

  const [playerName, setPlayerName] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    const saved = localStorage.getItem("playerName");
    if (saved) setPlayerName(saved);
  }, []);

  useEffect(() => {
    // Build leaderboard from localStorage "quizScores"
    const raw = localStorage.getItem("quizScores");
    if (!raw) {
      setLeaderboard([]);
      return;
    }

    try {
      const scoresObj = JSON.parse(raw || "{}");
      // Map: player -> quiz -> bestScore
      const perPlayerPerQuiz: Record<string, Record<string, number>> = {};

      Object.keys(scoresObj).forEach((quizTitle) => {
        const attempts = Array.isArray(scoresObj[quizTitle])
          ? scoresObj[quizTitle]
          : [];
        attempts.forEach((a: any) => {
          const name = a.name || a.player || "Unknown";
          const score = typeof a.score === "number" ? a.score : 0;
          perPlayerPerQuiz[name] = perPlayerPerQuiz[name] || {};
          perPlayerPerQuiz[name][quizTitle] = Math.max(
            perPlayerPerQuiz[name][quizTitle] || 0,
            score
          );
        });
      });

      const rows: LeaderboardRow[] = Object.keys(perPlayerPerQuiz).map(
        (name) => {
          const perQuiz = perPlayerPerQuiz[name];
          const total = Object.values(perQuiz).reduce((s, v) => s + v, 0);
          const playedCount = Object.keys(perQuiz).length;
          return { name, total, playedCount, perQuiz };
        }
      );

      rows.sort((a, b) => b.total - a.total || b.playedCount - a.playedCount);

      setLeaderboard(rows);
    } catch (e) {
      setLeaderboard([]);
    }
  }, [quizzes]);

  const totalPossible = quizzes.reduce(
    (sum, q) => sum + (q.questions?.length || 0),
    0
  );

  return (
    <MaxWidthWrapper
      className={cn(
        selectedQuizz && "xl:place-content-center",
        "grid px-6 grid-cols-1 md:grid-cols-2 gap-10 xl:gap-20 lg:px-0 relative z-50 h-full"
      )}
    >
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-center xs:gap-4 md:gap-10 lg:mt-28 xl:mt-0"
      >
        <p className="text-perameri dark:text-jakala"><Link href="/">&larr; Takaisin visoihin</Link></p>
        <h1 className="xs:text-4xl md:text-5xl font-normal text-yotaivas dark:text-valkoinen xl:text-6xl 2xl:text-6xl">
          <span className="xs:text-2xl md:text-3xl">
            Oulu2026-pikkujouluvisan
          </span>{" "}
          <span className="font-bold my-1 uppercase">hall of fame</span>
        </h1>

        {/* Leaderboard */}
        <div className="mt-6 w-full">
          {leaderboard.length === 0 ? (
            <div className="p-4 rounded-xl bg-valkoinen dark:bg-perameri text-yotaivas dark:text-valkoinen">
              Ei vielä tuloksia. <Link href="/" className="underline">Pelaa visoja</Link> ja palaile tänne!
            </div>
          ) : (
            <div className="rounded-xl bg-valkoinen dark:bg-perameri p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-yotaivas dark:text-valkoinen">
                        #
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-yotaivas dark:text-valkoinen">
                        Nimi
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-yotaivas dark:text-valkoinen">
                        Pisteet
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-yotaivas dark:text-valkoinen">
                        Edistyminen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {leaderboard.map((row, i) => {
                      const isCurrent = playerName && row.name === playerName;
                      const percent = quizzes.length > 0 ? Math.round((row.playedCount / quizzes.length) * 100) : 0;

                      return (
                        <tr
                          key={row.name}
                          className={cn(
                            "transition-colors",
                            isCurrent ? "bg-perameri/10 dark:bg-perameri/20" : ""
                          )}
                        >
                          <td className="py-3 px-3">{i + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-medium",
                                  isCurrent ? "text-perameri" : "text-yotaivas dark:text-valkoinen"
                                )}
                              >
                                {row.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {row.total}/{totalPossible}
                          </td>
                          {/* changed: show percentage of quizzes played */}
                          <td className="py-3 px-3">
                            {percent}% 
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </MotionDiv>
    </MaxWidthWrapper>
  );
}
