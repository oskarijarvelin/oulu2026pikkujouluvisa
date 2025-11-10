export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string | string[]; // Can be single answer or array of answers
  isCorrectUserAnswer?: boolean | null;
  userSelectedAnswer?: string | string[] | null; // Can be single or multiple selections
  pointsEarned?: number;
}

export interface QuizOptions {
  timeBasedScoring?: boolean;
  fullPointsThreshold?: number; // in milliseconds
  halfPointsThreshold?: number; // in milliseconds
  iconColor?: string;
  iconBgColor?: string;
}

export interface Quizz {
  title: string;
  questions: Question[];
  options?: QuizOptions;
}
