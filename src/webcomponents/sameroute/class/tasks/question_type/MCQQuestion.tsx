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
    <div className="space-y-5">
      <div
        className="text-base font-semibold leading-relaxed text-slate-800 prose prose-slate max-w-none prose-p:my-0 break-words"
        dangerouslySetInnerHTML={{
          __html: (question.config.question || "").replace(/&nbsp;/g, " "),
        }}
      />

      <div className="grid gap-2.5">
        {question.config.options.map((option, index) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + index);
          const cleanOption =
            typeof option === "string"
              ? option.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
              : option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => !submitted && setAnswer(option)}
              disabled={submitted}
              className={cn(
                "w-full text-left px-4 py-3.5 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer shadow-2xs",
                !submitted &&
                  !isSelected &&
                  "border-slate-200/90 bg-white hover:border-primary/40 hover:bg-primary/10 text-slate-700",
                isSelected &&
                  !submitted &&
                  "border-primary bg-primary/10 text-blue-950 font-semibold ring-1 ring-primary/25 shadow-xs",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-colors",
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 text-slate-600 border-slate-200/90",
                )}
              >
                {letter}
              </span>
              <span className="flex-1 text-sm font-medium leading-normal">{cleanOption}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};