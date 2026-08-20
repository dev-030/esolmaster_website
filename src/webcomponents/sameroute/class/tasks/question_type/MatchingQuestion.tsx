/* eslint-disable react-hooks/purity */
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
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
  const normalizedPairs: RenderPair[] = useMemo(() => {
    const rawPairs = Array.isArray(question.config?.pairs) ? question.config.pairs : [];
    if (rawPairs.length > 0) {
      return rawPairs.reduce<RenderPair[]>((acc, pair, index) => {
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
      }, []);
    }

    const config = question.config as any;
    const leftItems = Array.isArray(config?.leftItems) ? config.leftItems : [];
    const rightItems = Array.isArray(config?.rightItems) ? config.rightItems : [];
    const matches = config?.matches ?? {};

    return leftItems
      .map((left: string, index: number) => {
        const rightIndex = matches[String(index)] ?? index;
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
          id: String(index),
          left,
          right: {
            type: rightType,
            value: rightValue,
          },
        };
      })
      .filter((pair: any): pair is RenderPair => Boolean(pair));
  }, [question.config]);

  // Keep right items in the exact, stable order configured in the admin
  const rightItems = useMemo<RenderRightItem[]>(() => {
    const config = question.config as any;
    if (Array.isArray(config?.rightItems) && config.rightItems.length > 0) {
      return config.rightItems.map((item: any, idx: number) => {
        const isObj = typeof item === "object" && item !== null;
        const type = isObj && item.type === "image" ? "image" : "definition";
        const value = typeof item === "string" ? item : (item?.value || "");
        return {
          key: `right-${idx}`,
          type,
          value,
        };
      });
    }

    return normalizedPairs.map((pair, index) => ({
      key: `right-${index}`,
      ...pair.right,
    }));
  }, [question.config, normalizedPairs]);

  const matched: string[] = Array.isArray(userAnswer) ? userAnswer : [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (leftId: string) => {
    if (submitted) return;
    setSelectedLeft((prev) => (prev === leftId ? null : leftId));
  };

  const handleRightClick = (rightKey: string) => {
    if (submitted) return;

    if (selectedLeft) {
      // Connect selected left item to this right item
      const filtered = matched
        .filter((m) => !m.startsWith(`${selectedLeft}::`))
        .filter((m) => !m.endsWith(`::${rightKey}`));

      setAnswer([...filtered, `${selectedLeft}::${rightKey}`]);
      setSelectedLeft(null);
    } else {
      // Unlink if clicked when no left item is selected
      const isConnected = matched.some((m) => m.endsWith(`::${rightKey}`));
      if (isConnected) {
        setAnswer(matched.filter((m) => !m.endsWith(`::${rightKey}`)));
      }
    }
  };

  // Helper to find which left pair is connected to a right item
  const getConnectedLeftIndex = (rightKey: string): number | undefined => {
    const match = matched.find((m) => m.endsWith(`::${rightKey}`));
    if (!match) return undefined;
    const leftId = match.split("::")[0];
    const idx = normalizedPairs.findIndex((p) => p.id === leftId);
    return idx >= 0 ? idx : undefined;
  };

  // Helper to find which right item key is connected to a left pair
  const getMatchedRightKey = (leftId: string): string | undefined => {
    const match = matched.find((m) => m.startsWith(`${leftId}::`));
    return match ? match.split("::")[1] : undefined;
  };

  const selectedLeftPair = normalizedPairs.find((p) => p.id === selectedLeft);

  const rowHeight = 44; // px height per row
  const rowGap = 12; // px gap between rows

  return (
    <div className="space-y-4">
      {/* Question Prompt */}
      {question.config?.question && (
        <div 
          className="text-base font-semibold leading-relaxed text-slate-900 prose prose-slate max-w-none prose-p:my-0 break-words"
          dangerouslySetInnerHTML={{ __html: (question.config.question || "Match the following items.").replace(/&nbsp;/g, ' ') }}
        />
      )}

      {/* Active Matching Hint */}
      {!submitted && (
        <div className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-700 font-medium flex items-center justify-between shadow-2xs">
          <span>
            {selectedLeftPair ? (
              <>Matching term: <strong className="text-blue-700 underline underline-offset-2">{selectedLeftPair.left}</strong>. Click its definition on the right to connect them.</>
            ) : (
              "Click a term on the left, then click its matching definition on the right."
            )}
          </span>
          {selectedLeft && (
            <button
              type="button"
              onClick={() => setSelectedLeft(null)}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold ml-2 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Matching Board (Two Fixed Columns with SVG Connection Strings) */}
      <div className="relative border border-slate-200/80 bg-slate-50/25 rounded-xl p-4">
        {/* SVG Bezier Connection Strings Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
          <svg className="w-full h-full">
            {normalizedPairs.map((pair, lIdx) => {
              const matchedKey = getMatchedRightKey(pair.id);
              if (!matchedKey) return null;
              const rIdx = rightItems.findIndex((r) => r.key === matchedKey);
              if (rIdx < 0) return null;

              const isSelected = selectedLeft === pair.id;

              // Estimated anchor Y positions
              const startY = 32 + lIdx * (rowHeight + rowGap) + rowHeight / 2;
              const endY = 32 + rIdx * (rowHeight + rowGap) + rowHeight / 2;

              return (
                <path
                  key={`line-${pair.id}-${matchedKey}`}
                  d={`M calc(50% - 30px) ${startY} C calc(50% - 5px) ${startY}, calc(50% + 5px) ${endY}, calc(50% + 30px) ${endY}`}
                  fill="none"
                  stroke={isSelected ? "#2563eb" : "#60a5fa"}
                  strokeWidth={isSelected ? "2.5" : "1.75"}
                  opacity={isSelected ? 1 : 0.85}
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-20">
          {/* Left Column (Terms) */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Terms</span>
              <span className="text-[10px] text-slate-400 font-normal">Connect Anchor</span>
            </div>

            <div className="space-y-3">
              {normalizedPairs.map((pair, lIdx) => {
                const isSelected = selectedLeft === pair.id;
                const isConnected = Boolean(getMatchedRightKey(pair.id));

                return (
                  <div
                    key={pair.id}
                    onClick={() => handleLeftClick(pair.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 p-2 rounded-xl border bg-white transition-all cursor-pointer select-none",
                      isSelected
                        ? "border-blue-400 ring-2 ring-blue-400/20 shadow-xs bg-blue-50/30"
                        : isConnected
                          ? "border-slate-200 hover:border-slate-300 shadow-2xs"
                          : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 shadow-2xs"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate flex-1">
                      {/* Left Order Number Circle Badge */}
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 bg-slate-100 border border-slate-200 text-slate-600">
                        {lIdx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 truncate">{pair.left}</span>
                    </div>

                    {/* Left Anchor Pin */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeftClick(pair.id);
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer",
                        isSelected
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 shadow-xs"
                          : isConnected
                            ? "border-blue-300 bg-blue-50/50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-colors",
                          isSelected ? "bg-blue-600 scale-125" : isConnected ? "bg-blue-500" : "bg-slate-300"
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (Definitions in fixed places) */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Definitions</span>
              <span className="text-[10px] text-slate-400 font-normal">Matched Left #</span>
            </div>

            <div className="space-y-3">
              {rightItems.map((right) => {
                const connectedLIdx = getConnectedLeftIndex(right.key);
                const isConnected = connectedLIdx !== undefined;
                const isImg = right.type === "image" || isCloudinaryUrl(right.value);

                return (
                  <div
                    key={right.key}
                    onClick={() => handleRightClick(right.key)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-xl border bg-white transition-all cursor-pointer select-none",
                      isConnected
                        ? "border-slate-200 hover:border-slate-300 shadow-2xs"
                        : selectedLeft
                          ? "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 shadow-2xs"
                    )}
                  >
                    {/* Right Anchor Button (Displays Left Item's Order Number if matched, or empty dashed circle if unlinked) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRightClick(right.key);
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all shrink-0 cursor-pointer",
                        isConnected
                          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs"
                          : "bg-white text-transparent border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                        selectedLeft ? "ring-2 ring-blue-400/30 animate-pulse" : ""
                      )}
                      title={
                        selectedLeft
                          ? `Click to connect with selected term`
                          : isConnected
                            ? `Connected to #${(connectedLIdx ?? 0) + 1} (Click to unlink)`
                            : "Click to match"
                      }
                    >
                      {isConnected ? (connectedLIdx ?? 0) + 1 : ""}
                    </button>

                    <div className="text-xs font-medium text-slate-800 truncate flex-1">
                      {isImg ? (
                        <Image
                          src={right.value}
                          alt="Definition"
                          width={140}
                          height={32}
                          className="h-6 object-contain rounded"
                        />
                      ) : (
                        <span className="truncate">{right.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};