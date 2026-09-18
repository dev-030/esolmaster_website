"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BookOpen, Pencil } from "lucide-react";
import { useState } from "react";
import { EditorMode } from "../../wrapper/allShared";
import { EntryField, EntryFieldData } from "@/webcomponents/reusable";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GrammarLearningData {
  title: string;
  explanation: string;
  entry: EntryFieldData;
}

interface GrammarLearningProps {
  mode?: EditorMode; // "create" | "edit" | "disabled"
  value: GrammarLearningData;
  onChange: (data: GrammarLearningData) => void;
}

// ── Disabled Field ─────────────────────────────────────────────────────────────

const DisabledField = ({
  value,
  placeholder = "—",
  multiline = false,
}: {
  value: string;
  placeholder?: string;
  multiline?: boolean;
}) => {
  const isEmpty = !value.trim();

  return (
    <div
      className={cn(
        "w-full rounded-md bg-muted/60 border border-border px-3 py-2 text-sm",
        isEmpty && "text-muted-foreground/50 italic",
        multiline && "min-h-20 whitespace-pre-wrap"
      )}
    >
      {isEmpty ? placeholder : value}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export const GrammarLearning = ({
  mode = "create",
  value,
  onChange,
}: GrammarLearningProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  const handleEdit = () => {
    setCurrentMode("edit");
  };

  return (
    <Card
      className={cn("transition-all duration-200", isDisabled && "bg-muted/30")}
    >
      {/* Header */}
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Grammar Learning
            </p>
            <p className="text-xs text-muted-foreground">
              Grammar rule or concept
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={isDisabled ? "secondary" : isEditing ? "info" : "outline"}
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
              onClick={handleEdit}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Grammar Title
          </Label>

          {isDisabled ? (
            <DisabledField value={value.title} placeholder="No title set" />
          ) : (
            <Input
              placeholder="e.g. Present Perfect Tense"
              value={value.title}
              onChange={(e) =>
                onChange({ ...value, title: e.target.value })
              }
              className="text-sm"
            />
          )}
        </div>

        {/* Entry */}
        <EntryField
          value={value.entry}
          onChange={(entry) =>
            onChange({ ...value, entry })
          }
          disabled={isDisabled}
        />

        {/* Explanation */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Explanation
          </Label>

          {isDisabled ? (
            <DisabledField
              value={value.explanation}
              placeholder="No explanation set"
              multiline
            />
          ) : (
            <Textarea
              placeholder="Explain the grammar rule clearly for students…"
              value={value.explanation}
              onChange={(e) =>
                onChange({ ...value, explanation: e.target.value })
              }
              rows={4}
              className="text-sm resize-none"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};