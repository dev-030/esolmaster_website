"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, ListChecks, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CorrectToggleInput } from "../wrapper/CorrectToggleInput";
import { PercentageBar } from "../wrapper/PercentageBar";
import { EditorMode, VocabSuggestion } from "../wrapper/allShared";
import { DisabledField } from "@/webcomponents/reusable";
import { CriteriaInfiniteSelect } from "./CriteriaInfiniteSelect";

export interface MCQData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  criterionId?: string;
  marks?: number;
}

interface MCQQuestionProps {
  mode?: EditorMode;
  initialData?: MCQData;
  useVocabSuggestions?: boolean;
  percentage?: number;
  onSave?: (data: MCQData) => void;
  onCancel?: () => void;
  vocabSuggestions?: VocabSuggestion[];
  onSearchSuggestion?: (value: string) => void;
  showCriterion?: boolean;
}

const DEFAULT_DATA: MCQData = {
  question: "",
  options: ["", "", "", ""],
  correctIndex: -1,
  explanation: "",
  marks: 1,
};

export const MCQQuestion = ({
  mode = "create",
  initialData = DEFAULT_DATA,
  useVocabSuggestions = false,
  percentage,
  onSave,
  onCancel,
  vocabSuggestions,
  onSearchSuggestion,
  showCriterion = false,
}: MCQQuestionProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [data] = useState<MCQData>(initialData);
  const [draft, setDraft] = useState<MCQData>(initialData);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  const handleSave = (updates: Partial<MCQData>) => {
    const updatedData = { ...draft, ...updates };
    setDraft(updatedData);
    onSave?.(updatedData);
  };

  const setOption = (index: number, value: string) => {
    const updatedOptions = [...draft.options];
    updatedOptions[index] = value;
    handleSave({ options: updatedOptions });
  };

  const addOption = () => {
    handleSave({ options: [...draft.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = draft.options.filter((_, i) => i !== index);
    let newCorrectIndex = draft.correctIndex;
    if (draft.correctIndex === index) {
      newCorrectIndex = -1;
    } else if (draft.correctIndex > index) {
      newCorrectIndex = draft.correctIndex - 1;
    }
    handleSave({ options: newOptions, correctIndex: newCorrectIndex });
  };

  return (
    <Card className={cn("transition-all w-full")}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <ListChecks className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">MCQ Question</p>
            <p className="text-xs text-muted-foreground">
              Multiple choice — one correct answer
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

      <CardContent className="space-y-4 w-full">
        <div className="space-y-1.5 w-full">
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
              value={draft.question}
              placeholder="No question set"
            />
          ) : (
            <Input
              placeholder="Type the question…"
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

        <div className="space-y-2 w-full">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Options
            {!isDisabled && (
              <span className="text-muted-foreground font-normal ml-1">
                — click ✓ to mark correct
              </span>
            )}
          </Label>

          {(isDisabled ? data.options : draft.options).map((optValue, i) => {
            const label = String.fromCharCode(65 + i); // A, B, C, D, E...
            return (
              <div key={i} className="flex items-center gap-2 w-full">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 border",
                    (isDisabled ? data.correctIndex : draft.correctIndex) === i
                      ? "bg-emerald-50 border-emerald-500 text-white"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </span>

                {isDisabled ? (
                  <div
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 text-sm border",
                      data.correctIndex === i
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                        : "bg-muted/60 border-border",
                    )}
                  >
                    {data.options[i] || (
                      <span className="text-muted-foreground/50 italic text-xs">
                        Empty
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    <CorrectToggleInput
                      value={draft.options[i] || ""}
                      onChange={(v) => setOption(i, v)}
                      isCorrect={draft.correctIndex === i}
                      onToggleCorrect={() => handleSave({ correctIndex: i })}
                      placeholder={`Option ${label}`}
                      useVocabSuggestion={useVocabSuggestions}
                      suggestions={vocabSuggestions}
                      onSearchSuggestion={onSearchSuggestion}
                      onSelectSuggestion={(s) => setOption(i, s.wordName)}
                    />
                    
                    {draft.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive h-10 w-10"
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

        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Answer Explanation
            <span
              className={cn(
                "font-normal ml-1",
                isDisabled
                  ? "text-muted-foreground/60"
                  : "text-muted-foreground",
              )}
            >
              (shown after submission)
            </span>
          </Label>

          {isDisabled ? (
            <DisabledField
              value={draft.explanation}
              placeholder="No explanation added"
              multiline
            />
          ) : (
            <Input
              placeholder="Explain why the correct answer is right…"
              value={draft.explanation}
              onChange={(e) => handleSave({ explanation: e.target.value })}
            />
          )}
        </div>

        {isDisabled && typeof percentage === "number" && (
          <PercentageBar percentage={percentage} />
        )}

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
