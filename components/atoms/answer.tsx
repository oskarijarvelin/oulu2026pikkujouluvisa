import { cn } from "@/lib/utils";
import { CircleCheck, CircleX } from "lucide-react";

type AnswerProps = {
  answer: string;
  selectedAns: string;
  isCorrectUserAnswer: boolean;
  handleSelectAnswer: (answer: string) => void;
  index: number;
  answerLabels: string[];
  pointsEarned?: number;
};
const Answer = ({
  answer,
  selectedAns,
  isCorrectUserAnswer,
  handleSelectAnswer,
  index,
  answerLabels,
}: AnswerProps) => {

  return (
    <li>
      <button
        onClick={(e) => {
          handleSelectAnswer(answer);
        }}
        className={cn(
          selectedAns === answer && "ring-perameri ring-1",
          isCorrectUserAnswer && selectedAns === answer && "ring-green",

          // when an answer is already selected, disable hover/group-hover styles
          !selectedAns &&
            // apply hover/group-hover only on lg and up
            "w-full flex items-center gap-x-4 group bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas lg:hover:text-perameri ring-1 ring-harmaa dark:ring-jakala",
          selectedAns &&
            "w-full flex items-center gap-x-4 bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas ring-1 ring-harmaa",
          isCorrectUserAnswer === false && selectedAns === answer && "ring-puolukka"
        )}
      >
        <span
          className={cn(
            selectedAns === answer
              ? "bg-perameri text-valkoinen"
              : "bg-valkoinen dark:bg-yotaivas dark:text-jakala",
            // only apply group-hover classes on lg+ so mobile doesn't get hover effects
            !selectedAns &&
              "lg:group-hover:text-valkoinen lg:dark:group-hover:text-valkoinen lg:group-hover:bg-perameri lg:dark:group-hover:bg-perameri transition-all ring-1 ring-harmaa dark:ring-jakala",
            "text-lg rounded-lg py-2 px-4",
            isCorrectUserAnswer === false && selectedAns === answer && "bg-puolukka",
            isCorrectUserAnswer && selectedAns === answer && "bg-metsa"
          )}
        >
          {answerLabels[index]}
        </span>
        <span className="xl:text-lg text-left">{answer}</span>
        {isCorrectUserAnswer && selectedAns === answer && (
          <span className="ml-auto flex items-center gap-2">
            <CircleCheck color="#14502E" />
          </span>
        )}
        {isCorrectUserAnswer === false && selectedAns === answer && (
          <span className="ml-auto flex items-center gap-2">
            <CircleX color="#F1334B" />
          </span>
        )}
      </button>
    </li>
  );
};

export default Answer;
