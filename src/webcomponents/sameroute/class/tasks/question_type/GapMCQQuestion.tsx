"use client";

import { GapFillConfig } from "@/types/question";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types/attempt";

const GAP_REGEX = /(?:_{2,}|\.{3,}|…|\[(?:blank|gap)\])/i;

export const GapMCQQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<GapFillConfig>) => {
  const selected = userAnswer;

  const rawQuestion = (question.config.question || "").replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  const hasGap = GAP_REGEX.test(rawQuestion);
  const parts = hasGap ? rawQuestion.split(GAP_REGEX) : [rawQuestion, ""];

  return (
    <div className="space-y-5">
      {/* Question Prompt with clean solid underline gap */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-2xs">
        <p className="text-base font-medium text-slate-800 leading-loose flex flex-wrap items-baseline gap-y-2">
          <span>{parts[0]}</span>

          {selected ? (
            <span className="inline-flex items-center justify-center px-3.5 py-0.5 mx-1.5 font-bold text-primary border-b-2 border-primary bg-primary/10 rounded-t min-w-[90px] text-center transition-all">
              {selected}
            </span>
          ) : (
            <span
              className="inline-block min-w-[100px] border-b-2 border-slate-400 mx-1.5 h-4 align-baseline"
              aria-label="blank space"
            />
          )}

          {parts[1] && <span>{parts[1]}</span>}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {question.config.options?.map((option, idx) => {
          const isSelected = selected === option;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={`${option}-${idx}`}
              type="button"
              onClick={() => !submitted && setAnswer(option)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 border rounded-xl font-medium text-sm transition-all text-left cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/10 text-blue-950 shadow-2xs font-semibold ring-1 ring-primary/30"
                  : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50 text-slate-800"
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  isSelected
                    ? "bg-primary text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 group-hover:bg-primary/5 group-hover:text-primary/90"
                )}
              >
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
