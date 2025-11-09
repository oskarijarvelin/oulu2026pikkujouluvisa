"use client";
import { Quizz } from "@/lib/types";
import { useQuestionStore } from "@/store/quiz-store";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";

const DECIMALS = 1;

function formatPoints(value: number) {
  if (!Number.isFinite(value)) return String(value);
  return value.toFixed(DECIMALS);
}

type SubjectsProps = {
  data: Quizz[];
};

const Subjects = ({ data }: SubjectsProps) => {
  const subjects = data.map((q) => ({ title: q.title, icon: q.icon, bgcolor: q.bgcolor }));
  const selectQuizz = useQuestionStore((state) => state.selectQuizz);

  // Player name handling
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  // Track client mount to avoid using localStorage during SSR
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const saved = localStorage.getItem("playerName");
    if (saved) setPlayerName(saved);
  }, [isMounted]);

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem("playerName", trimmed);
    setPlayerName(trimmed);
    setNameInput("");
  };

  // Get scores from localStorage — always return total questions, best may be null
  const getQuizScore = (title: string) => {
    const totalQuestions = data.find((q) => q.title === title)?.questions.length || 0;

    if (!isMounted || typeof window === "undefined") {
      return { best: null as number | null, total: totalQuestions };
    }

    const scores = JSON.parse(localStorage.getItem("quizScores") || "{}");
    const quizScores = scores[title] || [];

    if (quizScores.length === 0) {
      return { best: null as number | null, total: totalQuestions };
    }

    const bestScore = Math.max(...quizScores.map((s: any) => s.score));
    return { best: bestScore, total: totalQuestions };
  };

  // Calculate total score across all quizzes
  const getTotalScore = () => {
    // Compute total possible without localStorage so UI can show totals during SSR
    const totalPossible = data.reduce((sum, q) => sum + q.questions.length, 0);

    if (!isMounted || typeof window === "undefined") {
      return { score: 0, total: totalPossible };
    }

    const scores = JSON.parse(localStorage.getItem("quizScores") || "{}");
    let totalScore = 0;

    data.forEach((quiz) => {
      // Add best score if quiz was played
      const quizScores = scores[quiz.title] || [];
      if (quizScores.length > 0) {
        const bestScore = Math.max(...quizScores.map((s: any) => s.score));
        totalScore += bestScore;
      }
    });

    return { score: totalScore, total: totalPossible };
  };

  const totalScore = getTotalScore();

  // If no player name saved, ask for it before showing subjects
  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl">
        <form onSubmit={handleSaveName} className="w-full max-w-md flex flex-col gap-4">
          <label htmlFor="player-name" className="text-yotaivas dark:text-valkoinen font-medium">
            Kirjoita nimesi aloittaaksesi pikkujouluvisan
          </label>
          <input
            id="player-name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Oma tai ryhmäsi nimi tai nimimerkki"
            className="w-full px-4 py-3 rounded-xl border ring-1 focus:ring-perameri"
          />
          <div className="flex">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-perameri text-valkoinen font-semibold"
            >
              Aloita pikkujouvisa
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {subjects.map((subject) => {
        const score = getQuizScore(subject.title);
        const isPlayed = score.best !== null;

        return (
          <button
            key={subject.title}
            onClick={() => {
              if (!isPlayed) {
                selectQuizz(data.find((q) => q.title === subject.title)!);
              }
            }}
            disabled={isPlayed}
            className={cn(
              "flex items-center gap-x-4 bg-valkoinen dark:bg-perameri py-3 px-4 xl:py-5 rounded-2xl shadow-lg ring-1 ring-perameri/30 dark:ring-valkoinen transition-all",
              isPlayed
                ? "opacity-50 cursor-not-allowed ring-harmaa hover:ring-harmaa dark:ring-harmaa/50"
                : "hover:ring-perameri"
            )}
          >
            <div
              className={cn("p-2 rounded-lg", isPlayed && "opacity-75")}
              style={{ backgroundColor: subject.bgcolor }}
            >
              <Image
                src={subject.icon}
                alt="arrow"
                width={30}
                height={30}
                className={isPlayed ? "opacity-50" : ""}
              />
            </div>
            <div className="flex items-center justify-between gap-x-2 w-full">
              <p
                className={cn(
                  "text-yotaivas dark:text-valkoinen text-md lg:text-lg font-semibold",
                  isPlayed && "opacity-75"
                )}
              >
                {subject.title}
              </p>
              {/* Always show score field — use '-' for unknown best */}
              <span className="text-sm text-yotaivas dark:text-valkoinen opacity-75">
                Pisteesi:<br/>{isPlayed ? `${formatPoints(score.best!)}/${score.total}` : `-/${score.total}`}
              </span>
            </div>
          </button>
        );
      })}

      {/* Total score display */}
      {totalScore.total > 0 && (
        <div className="mt-6 p-4 bg-perameri rounded-xl text-center">
          <p className="text-valkoinen text-md lg:text-lg font-semibold">
            Kokonaispisteesi: {formatPoints(totalScore.score)}/{totalScore.total}
          </p>
        </div>
      )}
      <div>
        <p className="mt-4 text-center underline text-perameri dark:text-jakala"><Link href="/tulokset">Hall of Fame &rarr;</Link></p>
      </div>
    </div>
  );
};

export default Subjects;
