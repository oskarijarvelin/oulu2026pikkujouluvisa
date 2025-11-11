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
  isMultiAnswer?: boolean;
  isSubmitted?: boolean;
};

/**
 * Answer component - Displays a single answer option with interactive selection
 * Provides visual feedback for selection state and correctness after submission
 */
const Answer = ({
  answer,
  selectedAns,
  isCorrectUserAnswer,
  handleSelectAnswer,
  index,
  answerLabels,
  isMultiAnswer = false,
  isSubmitted = false,
}: AnswerProps) => {
  const isSelected = selectedAns === answer;
  
  // Determine ARIA label based on state
  const getAriaLabel = () => {
    if (isSubmitted && isSelected) {
      if (isCorrectUserAnswer) {
        return `${answerLabels[index]}: ${answer} - Oikea vastaus`;
      } else {
        return `${answerLabels[index]}: ${answer} - Väärä vastaus`;
      }
    }
    return `${answerLabels[index]}: ${answer}`;
  };

  return (
    <li>
      <button
        onClick={(e) => {
          handleSelectAnswer(answer);
        }}
        disabled={isSubmitted && !isMultiAnswer}
        aria-label={getAriaLabel()}
        aria-pressed={isSelected}
        aria-disabled={isSubmitted && !isMultiAnswer}
        className={cn(
          isSelected && "ring-perameri ring-1",
          isSubmitted && isCorrectUserAnswer && isSelected && "ring-green",

          // when an answer is already selected (in single mode) or submitted (in multi mode), disable hover/group-hover styles
          !isSelected && !isSubmitted &&
            // apply hover/group-hover only on lg and up
            "w-full flex items-center gap-x-4 group bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas lg:hover:text-perameri ring-1 ring-harmaa dark:ring-jakala",
          (isSelected || isSubmitted) &&
            "w-full flex items-center gap-x-4 bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas ring-1 ring-harmaa",
          isSubmitted && isCorrectUserAnswer === false && isSelected && "ring-puolukka"
        )}
      >
        <span
          className={cn(
            isSelected
              ? "bg-perameri text-valkoinen"
              : "bg-valkoinen dark:bg-yotaivas dark:text-jakala",
            // only apply group-hover classes on lg+ so mobile doesn't get hover effects
            !isSelected && !isSubmitted &&
              "lg:group-hover:text-valkoinen lg:dark:group-hover:text-valkoinen lg:group-hover:bg-perameri lg:dark:group-hover:bg-perameri transition-all ring-1 ring-harmaa dark:ring-jakala",
            "text-lg rounded-lg py-2 px-4",
            isSubmitted && isCorrectUserAnswer === false && isSelected && "bg-puolukka",
            isSubmitted && isCorrectUserAnswer && isSelected && "bg-metsa"
          )}
          aria-hidden="true"
        >
          {answerLabels[index]}
        </span>
        <span className="xl:text-lg text-left">{answer}</span>
        {isSubmitted && isCorrectUserAnswer && isSelected && (
          <span className="ml-auto flex items-center gap-2" aria-hidden="true">
            <CircleCheck color="#14502E" />
          </span>
        )}
        {isSubmitted && isCorrectUserAnswer === false && isSelected && (
          <span className="ml-auto flex items-center gap-2" aria-hidden="true">
            <CircleX color="#F1334B" />
          </span>
        )}
      </button>
    </li>
  );
};

export default Answer;
