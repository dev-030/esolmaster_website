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

        {question.config.options.map((option) => {

          const isSelected = selected === option;

          return (
            <button
              key={option}
              onClick={() => !submitted && setAnswer(option)}
              disabled={submitted}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border-2 flex items-center gap-3",
                !submitted && !isSelected && "border-border hover:border-primary/50 hover:bg-accent",
                isSelected && !submitted && "border-primary bg-primary/5 text-primary",
              )}
            >
              <span className="flex-1">{option}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
};