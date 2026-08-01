/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { QuestionComponentProps } from "@/types/attempt";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle } from "lucide-react";

export const TextInputQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<any>) => {

  const value =
    typeof userAnswer === "string"
      ? userAnswer
      : Array.isArray(userAnswer)
      ? userAnswer[0]
      : "";

  return (
    <div className="space-y-4">

      {/* Question */}
      <p className="text-base font-medium leading-relaxed text-foreground">
        {question.config?.question}
      </p>

      {/* Input */}
      <div className="relative">

        <Input
          value={value}
          onChange={(e) => !submitted && setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="Type your answer here…"
          className={cn(
            "pr-10 transition-colors"
          )}
        />

        {/* Optional indicator when submitted */}
        {/* {submitted && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {question.correct ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive" />
            )}
          </div>
        )} */}

      </div>

    </div>
  );
};