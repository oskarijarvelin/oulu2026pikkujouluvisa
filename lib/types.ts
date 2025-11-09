export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  isCorrectUserAnswer?: boolean | null;
  userSelectedAnswer?: string | null;
  pointsEarned?: number;
}

export interface QuizOptions {
  timeBasedScoring?: boolean;
  fullPointsThreshold?: number; // in milliseconds
  halfPointsThreshold?: number; // in milliseconds
  icon?: string; // lucide icon name
  iconColor?: string;
  iconBgColor?: string;
}

export interface Quizz {
  title: string;
  icon: string;
  bgcolor: string;
  questions: Question[];
  options?: QuizOptions;
}
