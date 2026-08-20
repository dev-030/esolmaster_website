"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, Rows3, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorMode, VocabSuggestion } from "../wrapper/allShared";
import { DisabledField } from "@/webcomponents/reusable";
import { CorrectToggleInput, PercentageBar } from "../wrapper";
import { CriteriaInfiniteSelect } from "./CriteriaInfiniteSelect";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GapFillData {
  question: string; // must contain "___" for the gap
  options: string[];
  correctIndex: number;
  explanation: string;
  criterionId?: string;
  marks?: number;
}

interface GapFillMCQQuestionProps {
  mode?: EditorMode;
  initialData?: GapFillData;
  percentage?: number;
  onSave?: (data: GapFillData) => void;
  onCancel?: () => void;
  vocabSuggestions?: VocabSuggestion[];
  onSearchSuggestion?: (value: string) => void;
  useVocabSuggestions?: boolean;
  showCriterion?: boolean;
}

const DEFAULT: GapFillData = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: -1,
  explanation: "",
  marks: 1,
};

// ── Preview: renders the sentence with the gap filled by the selected answer ──

const GAP_REGEX = /(?:_{2,}|\.{3,}|…|\[blank\])/i;

function SentencePreview({
  question,
  options,
  correctIndex,
}: {
  question: string;
  options: string[];
  correctIndex: number;
}) {
  const raw = (question || "").replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  const hasGap = GAP_REGEX.test(raw);
  const parts = hasGap ? raw.split(GAP_REGEX) : [raw, ""];
  const answer = correctIndex >= 0 ? options[correctIndex] : null;
  return (
    <div className="rounded-lg bg-muted/40 border px-4 py-3 text-sm leading-relaxed flex flex-wrap items-baseline gap-y-1">
      <span>{parts[0]}</span>
      <span
        className={cn(
          "inline-block mx-1.5 px-2.5 py-0.5 rounded-t border-b-2 font-semibold text-sm transition-all min-w-[80px] text-center",
          answer
            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
            : "border-slate-800 text-transparent select-none",
        )}
      >
        {answer || "___"}
      </span>
      {parts[1] ? <span>{parts[1]}</span> : null}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export const GapFillMCQQuestion = ({
  mode = "create",
  initialData = DEFAULT,
  percentage,
  onSave,
  onCancel,
  vocabSuggestions,
  onSearchSuggestion,
  useVocabSuggestions = false,
  showCriterion = false,
}: GapFillMCQQuestionProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [data] = useState<GapFillData>(initialData);
  const [draft, setDraft] = useState<GapFillData>(initialData);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  const handleUpdate = (updates: Partial<GapFillData>) => {
    const updated = { ...draft, ...updates };
    setDraft(updated);
    onSave?.(updated); // Sync with parent instantly
  };

  const setOption = (i: number, val: string) => {
    const o = [...draft.options];
    o[i] = val;
    handleUpdate({ options: o });
  };

  const addOption = () => {
    handleUpdate({ options: [...draft.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = draft.options.filter((_, i) => i !== index);
    let newCorrectIndex = draft.correctIndex;
    if (draft.correctIndex === index) {
      newCorrectIndex = -1;
    } else if (draft.correctIndex > index) {
      newCorrectIndex = draft.correctIndex - 1;
    }
    handleUpdate({ options: newOptions, correctIndex: newCorrectIndex });
  };

  return (
    <Card className={cn("transition-all", isDisabled && "bg-muted/30")}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
            <Rows3 className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Gap Fill MCQ</p>
            <p className="text-xs text-muted-foreground">
              Sentence with a blank — choose the word
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={isDisabled ? "secondary" : "info"}
            className="text-[10px]"
          >
            {currentMode === "create"
              ? "New"
              : currentMode === "edit"
                ? "Editing"
                : "Saved"}
          </Badge>
          {isDisabled && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                setDraft(data);
                setCurrentMode("edit");
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question with gap */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Question Sentence
            {!isDisabled && (
              <span className="font-normal text-muted-foreground ml-1">
                — use ___ for the blank
              </span>
            )}
          </Label>
          {isDisabled ? (
            <>
              <DisabledField
                value={data.question}
                placeholder="No question set"
              />
              {data.question.includes("___") && (
                <SentencePreview
                  question={data.question}
                  options={data.options}
                  correctIndex={data.correctIndex}
                />
              )}
            </>
          ) : (
            <>
              <Input
                placeholder="Type the question…"
                value={draft.question}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, question: e.target.value }))
                }
              />
              {draft.question.includes("___") && (
                <SentencePreview
                  question={draft.question}
                  options={draft.options}
                  correctIndex={draft.correctIndex}
                />
              )}
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {showCriterion && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Criterion</Label>
              <CriteriaInfiniteSelect
                value={draft.criterionId}
                disabled={isDisabled}
                onChange={(criterionId) => handleUpdate({ criterionId })}
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Options
            {!isDisabled && (
              <span className="font-normal text-muted-foreground ml-1">
                — click ✓ to mark correct
              </span>
            )}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(isDisabled ? data.options : draft.options).map((optValue, i) => {
              const label = String.fromCharCode(65 + i); // A, B, C, D...
              return (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border",
                      (isDisabled ? data.correctIndex : draft.correctIndex) === i
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>

                  {isDisabled ? (
                    <div
                      className={cn(
                        "flex-1 rounded-md px-3 py-1.5 text-xs border",
                        data.correctIndex === i
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                          : "bg-muted/60 border-border",
                      )}
                    >
                      {data.options[i] || (
                        <span className="text-muted-foreground/50 italic">
                          Empty
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      <CorrectToggleInput
                        value={draft.options[i]}
                        onChange={(v) => setOption(i, v)}
                        isCorrect={draft.correctIndex === i}
                        onToggleCorrect={() => handleUpdate({ correctIndex: i })}
                        placeholder={`Option ${label}`}
                        suggestions={vocabSuggestions}
                        onSearchSuggestion={onSearchSuggestion}
                        useVocabSuggestion={useVocabSuggestions}
                        onSelectSuggestion={(s) => setOption(i, s.wordName)}
                      />
                      
                      {draft.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8"
                          onClick={() => removeOption(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          
          {!isDisabled && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-dashed"
              onClick={addOption}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Answer Explanation
          </Label>
          {isDisabled ? (
            <DisabledField
              value={data.explanation}
              placeholder="No explanation added"
            />
          ) : (
            <Input
              placeholder="Explain why the correct answer is right…"
              value={draft.explanation}
              onChange={(e) => handleUpdate({ explanation: e.target.value })}
            />
          )}
        </div>

        {/* Percentage */}
        {isDisabled && typeof percentage === "number" && (
          <PercentageBar percentage={percentage} />
        )}

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-1">
            {currentMode === "edit" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(data);
                  setCurrentMode("disabled");
                  onCancel?.();
                }}
                className="gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
