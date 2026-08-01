/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { QuestionComponentProps } from "@/types/attempt";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";

// Sanitized config: { question, items: [{ id, text }] } (already shuffled server-side)
export const OrderingQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<any>) => {
  const shuffled: string[] = (question.config?.items ?? []).map((it: any) =>
    typeof it === "string" ? it : it?.text ?? "",
  );

  // The student's working order is an array of item texts.
  const order: string[] =
    Array.isArray(userAnswer) && userAnswer.length ? userAnswer : shuffled;

  // Seed the answer with the initial (shuffled) order so an untouched submit
  // still sends a full array.
  useEffect(() => {
    if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
      setAnswer(shuffled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const move = (i: number, dir: -1 | 1) => {
    if (submitted) return;
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setAnswer(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-base font-medium leading-relaxed text-foreground">
        {question.config?.question}
      </p>
      <p className="text-xs text-muted-foreground">
        Use the arrows to arrange the items into the correct order.
      </p>

      <div className="space-y-2">
        {order.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm"
          >
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="flex-1 text-sm">{item}</span>
            <div className="flex flex-col">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-5 w-6"
                disabled={submitted || i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-5 w-6"
                disabled={submitted || i === order.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
