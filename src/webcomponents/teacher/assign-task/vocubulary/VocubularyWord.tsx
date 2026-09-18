"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X, ImagePlus, Trash2, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorMode } from "../../wrapper/allShared";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface VocabWordData {
  id?: string;
  word: string;
  definition: string;
  imageUrl?: string;
  imageFile?: File; // for new uploads, not saved in DB
}

interface VocabularyWordProps {
  mode?: EditorMode;
  initialData?: VocabWordData;
  onSave?: (data: VocabWordData) => void;
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const VocabularyWord = ({
  mode = "create",
  initialData = { word: "", definition: "", imageUrl: "", imageFile: undefined },
  onSave,
  onCancel,
}: VocabularyWordProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [data, setData] = useState<VocabWordData>(initialData);
  const [draft, setDraft] = useState<VocabWordData>(initialData);
  const fileRef = useRef<HTMLInputElement>(null);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  const handleSave = () => {
    const saved = {
      ...draft,
      id: draft.id ?? Math.random().toString(36).slice(2, 8),
    };
    setData(saved);
    onSave?.(saved);
    if (currentMode === "edit") setCurrentMode("disabled");
  };

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setDraft((p) => ({
    ...p,
    imageUrl: URL.createObjectURL(file), // preview
    imageFile: file, // real file
  }));
};

useEffect(() => {
  onSave?.(draft);
}, [draft]);

  return (
    /* No Card wrapper — plain layout as requested */
    <div
      className={cn(
        "rounded-xl border p-4 space-y-4 transition-all duration-200",
        isDisabled
          ? "bg-muted/30 border-border"
          : "bg-background border-border shadow-none",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <BookMarked className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-sm font-semibold">Vocabulary Word</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={isDisabled ? "secondary" : "warning"}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: word + definition */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label
              className={cn(
                "text-xs font-semibold",
                isDisabled && "text-muted-foreground",
              )}
            >
              Word
            </Label>
            {isDisabled ? (
              <VocabDisabledField
                value={data.word}
                placeholder="No word set"
                large
              />
            ) : (
              <Input
                placeholder="e.g. Precipitation"
                value={draft.word}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, word: e.target.value }))
                }
                className="text-sm font-medium"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              className={cn(
                "text-xs font-semibold",
                isDisabled && "text-muted-foreground",
              )}
            >
              Definition
            </Label>
            {isDisabled ? (
              <VocabDisabledField
                value={data.definition}
                placeholder="No definition set"
              />
            ) : (
              <Input
                placeholder="e.g. Water falling from the sky"
                value={draft.definition}
                onChange={(e) =>
                  setDraft((p) => ({ ...p, definition: e.target.value }))
                }
                className="text-sm"
              />
            )}
          </div>
        </div>

        {/* Right: image */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground",
            )}
          >
            Image (optional)
          </Label>
          {isDisabled ? (
            data.imageUrl ? (
              <div className="rounded-lg overflow-hidden border h-24">
                <Image
                  src={data.imageUrl}
                  alt={data.word}
                  className="w-full h-full object-contain opacity-80"
                  height={96}
                  width={96}
                />
              </div>
            ) : (
              <div className="h-24 rounded-lg bg-muted/60 border flex items-center justify-center text-xs text-muted-foreground/50 italic">
                No image
              </div>
            )
          ) : draft.imageUrl ? (
            <div className="relative rounded-lg overflow-hidden border group h-24">
              <Image
                src={draft.imageUrl}
                alt="preview"
                className="w-full h-full object-contain"
                height={96}
                width={96}
              />
              <button
                onClick={() => setDraft((p) => ({ ...p, imageUrl: "" }))}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-amber-400 hover:text-amber-600 transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              <span className="text-[11px]">Upload image</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Actions */}
      {isEditing && (
        <div className="flex gap-2 pt-1 border-t">
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
            onClick={handleSave}
            className="gap-1.5 ml-auto"
            disabled={!draft.word.trim() || !draft.definition.trim()}
          >
            <Save className="w-3.5 h-3.5" />
            {currentMode === "create" ? "Save Word" : "Update Word"}
          </Button>
        </div>
      )}
    </div>
  );
};

function VocabDisabledField({
  value,
  placeholder,
  large,
}: {
  value: string;
  placeholder?: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-md bg-muted/60 border border-border px-3 py-2 text-sm",
        !value.trim() && "text-muted-foreground/50 italic",
        large && "font-semibold text-base",
      )}
    >
      {value.trim() || placeholder || "—"}
    </div>
  );
}
