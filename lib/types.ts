/**
 * Represents a single quiz question
 */
export interface Question {
  /** Unique identifier for the question */
  id: number;
  /** The question text displayed to the user */
  question: string;
  /** Array of possible answer choices */
  options: string[];
  /** Correct answer(s) - can be a single string or array for multiple correct answers */
  answer: string | string[];
  /** Whether the user's answer was correct (set after answering) */
  isCorrectUserAnswer?: boolean | null;
  /** The answer(s) selected by the user */
  userSelectedAnswer?: string | string[] | null;
  /** Points earned for this question (based on correctness and time) */
  pointsEarned?: number;
}

/**
 * Configuration options for quiz scoring and appearance
 */
export interface QuizOptions {
  /** Enable/disable time-based scoring (default: true) */
  timeBasedScoring?: boolean;
  /** Time threshold for full points in milliseconds (default: 5000) */
  fullPointsThreshold?: number;
  /** Time threshold for half points in milliseconds (default: 10000) */
  halfPointsThreshold?: number;
  /** Icon color for the quiz */
  iconColor?: string;
  /** Background color for the icon */
  iconBgColor?: string;
}

/**
 * Represents a complete quiz with all its questions and settings
 */
export interface Quizz {
  /** Display name of the quiz */
  title: string;
  /** Array of questions in this quiz */
  questions: Question[];
  /** Optional configuration for quiz behavior and appearance */
  options?: QuizOptions;
}
