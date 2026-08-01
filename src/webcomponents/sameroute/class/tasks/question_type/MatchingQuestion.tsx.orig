/* eslint-disable react-hooks/purity */
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { MatchingConfig, QuestionComponentProps } from "@/types/attempt";

type RightOption = {
  type: "definition" | "image";
  value: string;
};

type RenderPair = {
  id: string;
  left: string;
  right: RightOption;
};

type RenderRightItem = RightOption & {
  key: string;
};

const isCloudinaryUrl = (value: string): boolean => {
  const trimmed = value.trim();

  if (!trimmed) return false;

  return /^(https?:\/\/)?res\.cloudinary\.com\//i.test(trimmed);
};

export const MatchingQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<MatchingConfig>) => {
  const pairs = Array.isArray(question.config.pairs)
    ? question.config.pairs
    : [];

  const normalizedPairs: RenderPair[] =
    pairs.length > 0
      ? pairs.reduce<RenderPair[]>((acc, pair, index) => {
          if (!pair?.left || !pair?.right) return acc;

          acc.push({
            id: pair.id ?? String(index),
            left: pair.left,
            right: {
              type: "definition",
              value: pair.right,
            },
          });

          return acc;
        }, [])
      : (() => {
          const config = question.config as {
            question?: string;
            leftItems?: string[];
            rightItems?: Array<
              | string
              | {
                  type?: "definition" | "image";
                  value?: string;
                }
            >;
            matches?: Record<string, number>;
          };

          const leftItems = Array.isArray(config.leftItems)
            ? config.leftItems
            : [];
          const rightItems = Array.isArray(config.rightItems)
            ? config.rightItems
            : [];
          const matches = config.matches ?? {};

          return leftItems
            .map((left, index) => {
              const rightIndex = matches[String(index)];

              if (typeof rightIndex !== "number") return null;

              const rightRaw = rightItems[rightIndex];

              const rightValue =
                typeof rightRaw === "string"
                  ? rightRaw
                  : typeof rightRaw?.value === "string"
                    ? rightRaw.value
                    : "";

              const rightType =
                typeof rightRaw === "object" && rightRaw?.type === "image"
                  ? "image"
                  : "definition";

              if (!left || !rightValue) return null;

              return {
                id: `${index}-${rightIndex}`,
                left,
                right: {
                  type: rightType,
                  value: rightValue,
                },
              };
            })
            .filter((pair): pair is RenderPair => Boolean(pair));
        })();

  const matched: string[] = Array.isArray(userAnswer) ? userAnswer : [];

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const rightItems = useMemo<RenderRightItem[]>(() => {
    return normalizedPairs
      .map((pair, index) => ({
        key: `${pair.id}-${index}`,
        ...pair.right,
      }))
      .sort(() => Math.random() - 0.5);
  }, [normalizedPairs]);

  const getMatchedRight = (leftId: string): string | undefined => {
    const match = matched.find((m) => m.startsWith(`${leftId}::`));

    if (!match) return undefined;

    const rightKey = match.split("::")[1];

    return rightItems.find((item) => item.key === rightKey)?.value;
  };

  const isRightUsed = (rightKey: string): boolean => {
    return matched.some((m) => m.endsWith(`::${rightKey}`));
  };

  const handleLeftClick = (leftId: string) => {
    if (submitted) return;

    setSelectedLeft((prev) => (prev === leftId ? null : leftId));
  };

  const handleRightClick = (rightKey: string) => {
    if (submitted || !selectedLeft) return;

    const filtered = matched
      .filter((m) => !m.startsWith(`${selectedLeft}::`))
      .filter((m) => !m.endsWith(`::${rightKey}`));

    setAnswer([...filtered, `${selectedLeft}::${rightKey}`]);

    setSelectedLeft(null);
  };

  const removeMatch = (leftId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (submitted) return;

    setAnswer(matched.filter((m) => !m.startsWith(`${leftId}::`)));
  };

  const getSelectedLeftLabel = (): string | undefined => {
    return normalizedPairs.find((pair) => pair.id === selectedLeft)?.left;
  };

  return (
    <div className="space-y-4">
      {/* Question */}
      <p className="text-base font-medium leading-relaxed text-foreground">
        {question.config.question || "Match the following items."}
      </p>

      {!submitted && (
        <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          {selectedLeft
            ? `Now select a match for: "${getSelectedLeftLabel()}"`
            : "Click a term on the left, then its matching definition on the right."}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Left Column */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Terms
          </p>

          {normalizedPairs.map((pair) => {
            const isSelected = selectedLeft === pair.id;
            const matchedRight = getMatchedRight(pair.id);

            return (
              <button
                key={pair.id}
                onClick={() => handleLeftClick(pair.id)}
                disabled={submitted}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border-2 text-sm transition-all",
                  !isSelected &&
                    !matchedRight &&
                    "border-border hover:border-primary/40",
                  isSelected && "border-primary bg-primary/5 text-primary",
                  matchedRight && "border-muted-foreground/30 bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{pair.left}</span>
                </div>

                {matchedRight && !submitted && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-primary/70 truncate">
                      → {matchedRight}
                    </span>

                    <button
                      onClick={(e) => removeMatch(pair.id, e)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Definitions
          </p>

          {rightItems.map((rightItem) => {
            const used = isRightUsed(rightItem.key);

            const shouldRenderImage =
              rightItem.type === "image" || isCloudinaryUrl(rightItem.value);

            return (
              <button
                key={rightItem.key}
                onClick={() => handleRightClick(rightItem.key)}
                disabled={submitted || (used && !selectedLeft)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border-2 text-xs transition-all overflow-hidden",
                  !submitted &&
                    selectedLeft &&
                    !used &&
                    "border-amber-300 hover:border-amber-500 hover:bg-amber-50",
                  !submitted &&
                    used &&
                    "border-primary/20 bg-primary/5 text-primary/60",
                  !submitted &&
                    !selectedLeft &&
                    !used &&
                    "border-border text-muted-foreground",
                )}
              >
                {shouldRenderImage ? (
                  <Image
                    src={rightItem.value}
                    alt="Matching option"
                    width={320}
                    height={80}
                    className="w-full h-20 object-contain rounded"
                  />
                ) : (
                  rightItem.value
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};