/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  GapMCQQuestion,
  MatchingQuestion,
  MCQQuestion,
  TextInputQuestion,
  WordBoxMatchQuestion,
  OrderingQuestion,
} from "./question_type";
import { BaseQuestion } from "@/types/attempt";


// Registry — add new types here only
const QUESTION_COMPONENTS = {
  mcq: MCQQuestion,
  true_false: MCQQuestion,
  gap_fill: GapMCQQuestion, // ✅ FIXED
  question_answer: TextInputQuestion,
  matching: MatchingQuestion,
  word_box_match: WordBoxMatchQuestion,
  ordering: OrderingQuestion,
} as const;

interface QuestionRendererProps {
  question: BaseQuestion<any>; // ✅ CHANGED
  userAnswer?: any;
  setAnswer: (answer: any) => void;
  submitted?: boolean;
}
export const QuestionRenderer = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionRendererProps) => {
  console.log("Rendering question:", question);
  const Component =
    QUESTION_COMPONENTS[
  question.type.toLowerCase() as keyof typeof QUESTION_COMPONENTS
]

  if (!Component) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
        Unknown question type: <strong>{question.type}</strong>
      </div>
    );
  }

  return (
    <Component
      question={question}
      userAnswer={userAnswer}
      setAnswer={setAnswer}
      submitted={submitted}
    />
  );
};
