"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { VocabSuggestionInput } from "../wrapper/VocubularySuggestion";
import { PercentageBar } from "../wrapper/PercentageBar";
import { EditorMode } from "../wrapper/allShared";
import { DisabledField } from "@/webcomponents/reusable";
import { CriteriaInfiniteSelect } from "./CriteriaInfiniteSelect";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface QAData {
  question: string;
  answer: string;
  criterionId?: string;
  marks?: number;
}

interface QuestionAnswerProps {
  mode?: EditorMode;
  initialData?: QAData;
  useVocabSuggestions?: boolean;
  percentage?: number;
  onSave?: (data: QAData) => void;
  onCancel?: () => void;
  showCriterion?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const QuestionAnswer = ({
  mode = "create",
  initialData = { question: "", answer: "", marks: 1 },
  useVocabSuggestions = false,
  percentage,
  onSave,
  onCancel,
  showCriterion = false,
}: QuestionAnswerProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [data] = useState<QAData>(initialData);
  const [draft, setDraft] = useState<QAData>(initialData);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  // ✅ Updated to match MCQ logic
  const handleSave = (updates: Partial<QAData>) => {
    const updatedData = { ...draft, ...updates };
    setDraft(updatedData);
    onSave?.(updatedData);
  };

  return (
    <Card className={cn("transition-all", isDisabled && "bg-muted/30")}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Question & Answer</p>
            <p className="text-xs text-muted-foreground">
              Short written answer question
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
        {/* Question */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Question
          </Label>
          {isDisabled ? (
            <DisabledField
              value={data.question}
              placeholder="No question set"
            />
          ) : useVocabSuggestions ? (
            <VocabSuggestionInput
              value={draft.question}
              onChange={(v) => handleSave({ question: v })}
              placeholder="e.g. What is the term for a long period of low rainfall?"
            />
          ) : (
            <Input
              placeholder="e.g. What is the term for a long period of low rainfall?"
              value={draft.question}
              onChange={(e) => handleSave({ question: e.target.value })}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {showCriterion && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Criterion</Label>
              <CriteriaInfiniteSelect
                value={draft.criterionId}
                disabled={isDisabled}
                onChange={(criterionId) => handleSave({ criterionId })}
              />
            </div>
          )}
        </div>

        {/* Answer */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Correct Answer
          </Label>
          {isDisabled ? (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800 font-medium">
              {data.answer || (
                <span className="text-muted-foreground/50 italic font-normal">
                  No answer set
                </span>
              )}
            </div>
          ) : useVocabSuggestions ? (
            <VocabSuggestionInput
              value={draft.answer}
              onChange={(v) => handleSave({ answer: v })}
              placeholder="e.g. Drought"
              className="border-emerald-200 focus-visible:ring-emerald-400"
            />
          ) : (
            <Input
              placeholder="Type the accepted answer…"
              value={draft.answer}
              onChange={(e) => handleSave({ answer: e.target.value })}
              className="border-emerald-200 focus-visible:ring-emerald-400"
            />
          )}
        </div>

        {/* Percentage bar */}
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
            <Button
              size="sm"
              onClick={() => handleSave({})}
              className="gap-1.5 ml-auto"
              disabled={!draft.question.trim() || !draft.answer.trim()}
            >
              <Save className="w-3.5 h-3.5" />
              {currentMode === "create" ? "Save" : "Update"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
