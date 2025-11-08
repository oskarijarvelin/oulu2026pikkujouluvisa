type ProgressProps = {
  currentIndex: number;
  total: number;
};
const Progress = ({ currentIndex, total }: ProgressProps) => {
  const progressPercentage = ((currentIndex) / total) * 100;

  return (
    <div className="w-full h-[5px] bg-harmaa dark:bg-perameri rounded-full">
      <div
        className="h-full bg-perameri dark:bg-jakala transition-all rounded-full"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default Progress;
