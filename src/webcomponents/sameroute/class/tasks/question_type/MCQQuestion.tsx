"use client";

import { MCQConfig } from "@/types/question";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types/attempt";

export const MCQQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<MCQConfig>) => {

  const selected = userAnswer;

  return (
    <div className="space-y-4">

      <div 
        className="text-base font-medium leading-relaxed text-foreground prose prose-slate max-w-none prose-p:my-0 break-words"
        dangerouslySetInnerHTML={{ __html: (question.config.question || "").replace(/&nbsp;/g, ' ') }}
      />

      <div className="grid gap-2">
        {question.config.options.map((option, index) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={option}
              type="button"
              onClick={() => !submitted && setAnswer(option)}
              disabled={submitted}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer",
                !submitted && !isSelected && "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/20 text-slate-700",
                isSelected && !submitted && "border-blue-500 bg-blue-50/50 text-blue-900 font-medium shadow-sm",
              )}
            >
              <span className={cn(
                "w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-colors",
                isSelected ? "bg-blue-500 text-white border-blue-500" : "bg-slate-100 text-slate-600 border-slate-200"
              )}>
                {letter}
              </span>
              <span className="flex-1 text-sm">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};