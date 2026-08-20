/* eslint-disable @typescript-eslint/no-explicit-any */
export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "GAP_FILL"
  | "WORD_BOX_MATCH"
  | "MATCHING"
  | "QUESTION_ANSWER"
  | "TEXT_INPUT"
  | "FLASHCARD"
  | "ORDERING"
  | "INSTRUCTION";

export interface BaseQuestion<TConfig = any> {
  id: string;
  taskId: string;
  type: QuestionType;
  order: number;
  config: TConfig;
  createdAt: string;
  criterionId?: string | null; 
}

export interface MCQConfig {
  question: string;
  options: string[];
}

export interface GapFillConfig {
  question: string;
  options: string[];
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingConfig {
  question: string;
  pairs: MatchingPair[];
}

export interface WordBoxSentence {
  id?: string;
  text: string;
  answer?: string;
}

export interface WordBoxMatchConfig {
  question?: string;
  words: string[];
  sentences: Array<string | WordBoxSentence>;
}

export interface QuestionComponentProps<TConfig = any> {
  question: BaseQuestion<TConfig>;
  userAnswer?: any;
  setAnswer: (answer: any) => void;
  submitted?: boolean;
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  correct: boolean;
  question: string;

  userAnswer: string | string[];

  correctAnswers: string[];

  note: string | null;
}

export interface AttemptResult {
  score: number;
  total: number;
  percentage: number;
  results: QuestionResult[];
}