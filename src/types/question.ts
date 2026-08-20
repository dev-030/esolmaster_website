export type QuestionType =
  | "MCQ"
  | "TRUE_FALSE"
  | "GAP_FILL"
  | "WORD_BOX_MATCH"
  | "MATCHING"
  | "QUESTION_ANSWER"
  | "ORDERING"
  | "INSTRUCTION";

export interface BaseQuestion<TConfig> {
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
  explanation?: string;
}

export interface GapFillConfig {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QAConfig {
  question: string;
  answer: string;
}

export interface MatchingConfig {
  left: string[];
  right: string[];
}

export interface WordBoxMatchConfig {
  words: string[];
  sentences: string[];
}