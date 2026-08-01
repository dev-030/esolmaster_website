"use client";

import { GapFillConfig } from "@/types/question";
import { cn } from "@/lib/utils";
import { QuestionComponentProps } from "@/types/attempt";

export const GapMCQQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<GapFillConfig>) => {

  const selected = userAnswer;

  const parts = question.config.question.split("__");

  return (
    <div className="space-y-5">

      <div className="rounded-xl border bg-muted/30 p-4">

        <p className="text-base font-medium leading-relaxed">

          {parts[0]}

          <span className="px-3 py-1 border-b-2 mx-2">
            {selected ?? "______"}
          </span>

          {parts[1]}

        </p>

      </div>

      <div className="grid grid-cols-2 gap-2">

        {question.config.options.map((option) => {

          const isSelected = selected === option;

          return (
            <button
              key={option}
              onClick={() => !submitted && setAnswer(option)}
              className={cn(
                "px-4 py-2 border rounded",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              {option}
            </button>
          );
        })}

      </div>

    </div>
  );
};