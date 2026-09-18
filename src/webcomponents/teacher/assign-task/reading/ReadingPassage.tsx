"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Save, X, FileText, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditorMode } from "../../wrapper/allShared";
import {
  DisabledField,
  EntryField,
  EntryFieldData,
} from "@/webcomponents/reusable";
import Image from "next/image";
import { AwardingBody } from "@/types/task";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReadingPassageData {
  title: string;
  passage: string;
  imageUrl?: string;
  imageFile?: File;
  awardingBody?: AwardingBody;
  passMark?: number;
  entry: EntryFieldData;
}

interface ReadingPassageProps {
  mode?: EditorMode;
  initialData?: ReadingPassageData;
  onSave?: (data: ReadingPassageData) => void;
  onChange?: (data: ReadingPassageData) => void;
  onCancel?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const ReadingPassage = ({
  mode = "create",
  initialData = {
    title: "",
    passage: "",
    imageUrl: "",
    imageFile: undefined,
    awardingBody: undefined,
    passMark: undefined,
    entry: { entryTypes: [] },
  },
  onSave,
  onChange,
  onCancel,
}: ReadingPassageProps) => {
  const [currentMode, setCurrentMode] = useState<EditorMode>(mode);
  const [data, setData] = useState<ReadingPassageData>(initialData);
  const [draft, setDraft] = useState<ReadingPassageData>(initialData);
  const fileRef = useRef<HTMLInputElement>(null);

  const isDisabled = currentMode === "disabled";
  const isEditing = currentMode === "edit" || currentMode === "create";

  const handleSave = () => {
    setData(draft);
    onSave?.(draft); // ONLY place onSave is called!
    if (currentMode === "edit") setCurrentMode("disabled");
  };

  const handleEdit = () => {
    setDraft(data);
    setCurrentMode("edit");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const next = { ...draft, imageUrl: url, imageFile: file };
    setDraft(next);
    onChange?.(next);
  };

  return (
    <Card
      className={cn("transition-all duration-200", isDisabled && "bg-muted/30")}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Reading Passage</p>
            <p className="text-xs text-muted-foreground">
              Text and image-based passage
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={
              isDisabled ? "secondary" : isEditing ? "success" : "outline"
            }
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

      <CardContent className="space-y-6">
        {/* 1. Title Section */}
        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Passage Title
          </Label>
          {isDisabled ? (
            <DisabledField value={data.title} placeholder="No title set" />
          ) : (
            <Input
              placeholder="e.g. The Ocean's Secrets"
              value={draft.title}
              onChange={(e) => {
                const next = { ...draft, title: e.target.value };
                setDraft(next);
                onChange?.(next);
              }}
              className="text-sm"
            />
          )}
        </div>

        <div className="space-y-1.5 border-t pt-4">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Awarding Body
          </Label>
          {isDisabled ? (
            <DisabledField
              value={data.awardingBody ?? ""}
              placeholder="No awarding body selected"
            />
          ) : (
            <Select
              value={draft.awardingBody ?? ""}
              onValueChange={(value) => {
                const next = {
                  ...draft,
                  awardingBody: value ? (value as AwardingBody) : undefined,
                };
                setDraft(next);
                onChange?.(next);
              }}
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue placeholder="Select awarding body" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AwardingBody.ESB}>ESB</SelectItem>
                <SelectItem value={AwardingBody.ASCENTIS}>ASCENTIS</SelectItem>
                <SelectItem value={AwardingBody.GATEWAY}>GATEWAY</SelectItem>
                <SelectItem value={AwardingBody.TRINITY}>TRINITY</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Pass Mark
          </Label>
          {isDisabled ? (
            <DisabledField
              value={data.passMark !== undefined ? String(data.passMark) : ""}
              placeholder="No pass mark set"
            />
          ) : (
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="e.g. 50"
              value={draft.passMark ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const next = {
                  ...draft,
                  passMark:
                    value === "" ? undefined : Number.parseInt(value, 10),
                };
                setDraft(next);
                onChange?.(next);
              }}
              className="text-sm"
            />
          )}
        </div>

        <EntryField
          value={draft.entry}
          onChange={(entry) => {
            const next = { ...draft, entry };
            setDraft(next);
            onChange?.(next);
          }}
          disabled={isDisabled}
        />

        {/* 2. Text Content Section (Upper) */}
        <div className="space-y-1.5 border-t pt-4">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Passage Text
          </Label>
          {isDisabled ? (
            <DisabledField
              value={data.passage}
              placeholder="No text content"
              multiline
            />
          ) : (
            <Textarea
              placeholder="Paste or type the reading passage here…"
              value={draft.passage}
              onChange={(e) => {
                const next = { ...draft, passage: e.target.value };
                setDraft(next);
                onChange?.(next);
              }}
              rows={6}
              className="text-sm resize-none"
            />
          )}
        </div>

        {/* 3. Image Section (Lower) */}
        <div className="space-y-1.5 border-t pt-4">
          <Label
            className={cn(
              "text-xs font-semibold",
              isDisabled && "text-muted-foreground"
            )}
          >
            Passage Image
          </Label>

          {isEditing ? (
            // Edit Mode: Upload or Preview with Delete
            draft.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border group w-full bg-black/5">
                <Image
                  src={draft.imageUrl}
                  alt="Passage"
                  height={208}
                  width={384}
                  className="w-full max-h-52 object-contain"
                />
                <button
                  onClick={() => {
                    const next = { ...draft, imageUrl: "", imageFile: undefined };
                    setDraft(next);
                    onChange?.(next);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center shadow-none border border-white/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs">Click to upload image</span>
              </button>
            )
          ) : (
            // Disabled Mode: Static Preview
            data.imageUrl ? (
              <div className="rounded-lg overflow-hidden border bg-black/5">
                <Image
                  src={data.imageUrl}
                  alt="Passage"
                  className="w-full max-h-52 object-contain"
                  height={208}
                  width={384}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No image attached
              </p>
            )
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-2 pt-2 border-t">
            {currentMode === "edit" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(data);
                  setCurrentMode("disabled");
                  onCancel?.();
                }}
              >
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              className="ml-auto"
              disabled={!draft.title.trim()}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {currentMode === "create" ? "Save Passage" : "Update Passage"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};