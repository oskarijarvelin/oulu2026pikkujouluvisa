import { cn } from "@/lib/utils";
import Image from "next/image";

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
  return (
    <li>
      <button
        onClick={() => handleSelectAnswer(answer)}
        className={cn(
          selectedAns === answer && "ring-perameri ring-1",
          isCorrectUserAnswer && selectedAns === answer && "ring-green",

          "w-full flex items-center gap-x-4 group bg-valkoinen dark:bg-jakala py-4 px-5 rounded-xl shadow-lg transition-all font-semibold text-sm text-yotaivas hover:text-perameri",
          isCorrectUserAnswer === false && selectedAns === answer && "ring-puolukka"
        )}
      >
        <span
          className={cn(
            selectedAns === answer
              ? "bg-perameri text-valkoinen"
              : "bg-harmaa dark:bg-yotaivas dark:text-jakala group-hover:text-perameri dark:group-hover:text-valkoinen group-hover:bg-harmaa dark:group-hover:bg-yotaivas transition-all",
            "text-lg rounded-lg py-2 px-4  ",
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
