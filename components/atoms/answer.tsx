import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef } from "react";

type AnswerProps = {
  answer: string;
  selectedAns: string;
  isCorrectUserAnswer: boolean;
  handleSelectAnswer: (answer: string) => void;
  index: number;
  answerLabels: string[];
};
const Answer = ({
  answer,
  selectedAns,
  isCorrectUserAnswer,
  handleSelectAnswer,
  index,
  answerLabels,
}: AnswerProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Clear focus when selectedAns is cleared (e.g. on question change)
  useEffect(() => {
    if (!selectedAns && buttonRef.current) {
      // If the currently focused element is inside this button, blur it.
      const active = document.activeElement as HTMLElement | null;
      if (active && buttonRef.current.contains(active)) {
        active.blur();
      } else {
        buttonRef.current.blur();
      }
    }
  }, [selectedAns]);

  return (
    <li>
      <button
        ref={buttonRef}
        onClick={(e) => {
          handleSelectAnswer(answer);
          // remove focus so focus styles don't persist
          (e.currentTarget as HTMLButtonElement).blur();
        }}
        className={cn(
          selectedAns === answer && "ring-perameri ring-1",
          isCorrectUserAnswer && selectedAns === answer && "ring-green",

          // when an answer is already selected, disable hover/group-hover styles
          !selectedAns &&
            "w-full flex items-center gap-x-4 group bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas hover:text-perameri",
          selectedAns &&
            "w-full flex items-center gap-x-4 bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas",
          isCorrectUserAnswer === false && selectedAns === answer && "ring-puolukka"
        )}
      >
        <span
          className={cn(
            selectedAns === answer
              ? "bg-perameri text-valkoinen"
              : "bg-harmaa dark:bg-yotaivas dark:text-jakala",
            // only apply group-hover classes when no answer has been selected yet
            !selectedAns &&
              "group-hover:text-perameri dark:group-hover:text-valkoinen group-hover:bg-harmaa dark:group-hover:bg-yotaivas transition-all",
            "text-lg rounded-lg py-2 px-4",
            isCorrectUserAnswer === false && selectedAns === answer && "bg-puolukka",
            isCorrectUserAnswer && selectedAns === answer && "bg-metsa"
          )}
        >
          {answerLabels[index]}
        </span>
        <span className="xl:text-lg">{answer}</span>
        {isCorrectUserAnswer && selectedAns === answer && (
          <span className="text-metsa ml-auto">
            <Image
              src="/assets/images/icon-correct.svg"
              alt="check"
              width={30}
              height={30}
            />
          </span>
        )}
        {isCorrectUserAnswer === false && selectedAns === answer && (
          <span className="text-puolukka ml-auto">
            <Image
              src="/assets/images/icon-error.svg"
              alt="cross"
              width={30}
              height={30}
            />
          </span>
        )}
      </button>
    </li>
  );
};

export default Answer;
