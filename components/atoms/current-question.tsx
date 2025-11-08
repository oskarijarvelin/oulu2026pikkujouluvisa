import { Question } from "@/lib/types";

type QuestionsProps = {
  data: Question;
};
const CurrentQuestion = ({data}: QuestionsProps) => {

  return (
    <div>
      <h2 className="text-yotaivas dark:text-valkoinen xs:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold">
        {data.question}
      </h2>
    </div>
  )
}

export default CurrentQuestion