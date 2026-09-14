"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Infinity, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Class, CreateClassPayload } from "@/types/class";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  color: z.string(),
});

export type ClassFormData = z.infer<typeof schema>;

const COLOR_OPTIONS = [
  "#3454FB", // Electric Blue (Primary Brand)
  "#2563EB", // Royal Blue
  "#0EA5E9", // Sky Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Amber Orange
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Coral Red
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Class | null;
  onSave: (cls: CreateClassPayload) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ClassDialog = ({
  open,
  onOpenChange,
  initial,
  onSave,
}: ClassDialogProps) => {
  const isEdit = !!initial;
  const [isSaving, setIsSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    initial?.color || "#3454FB"
  );
  const [hasLimit, setHasLimit] = useState<boolean>(false);
  const [limitValue, setLimitValue] = useState<number | string>(30);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      subject: "",
      description: "",
      color: "#3454FB",
    },
  });

  // Keep palette inclusive if the class already has a custom/legacy color
  const activePalette = useMemo(() => {
    if (
      initial?.color &&
      !COLOR_OPTIONS.some((c) => c.toLowerCase() === initial.color?.toLowerCase())
    ) {
      return [initial.color, ...COLOR_OPTIONS];
    }
    return COLOR_OPTIONS;
  }, [initial?.color]);

  useEffect(() => {
    if (open) {
      const initialColor = initial?.color || "#3454FB";
      setSelectedColor(initialColor);
      const initialHasLimit =
        initial?.maxStudents !== undefined &&
        initial?.maxStudents !== null &&
        initial.maxStudents > 0;
      setHasLimit(initialHasLimit);
      setLimitValue(initialHasLimit ? initial!.maxStudents! : 30);
      reset({
        name: initial?.name ?? "",
        subject: initial?.subject ?? "",
        description: initial?.description ?? "",
        color: initialColor,
      });
    }
  }, [open, initial, reset]);

  const handleColorSelect = (c: string) => {
    setSelectedColor(c);
    setValue("color", c, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: ClassFormData) => {
    let finalMaxStudents: number | null = null;
    if (hasLimit) {
      const parsed = Number(limitValue);
      if (isNaN(parsed) || parsed < 1) {
        toast.error("Please enter a valid student limit (at least 1)");
        return;
      }
      finalMaxStudents = Math.floor(parsed);
    }

    const cls: CreateClassPayload = {
      name: data.name,
      subject: data.subject,
      description: data.description,
      color: selectedColor || data.color,
      maxStudents: finalMaxStudents,
    };
    setIsSaving(true);
    try {
      await onSave(cls);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xl ring-0">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            {isEdit ? "Edit Class" : "Create New Class"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Update the class details below."
              : "Fill in the details to create a new class."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
              Class Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Intermediate English B2"
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#3454FB]/20"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-xs font-semibold text-slate-700">
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="e.g. English"
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#3454FB]/20"
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-xs text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-slate-700">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the class..."
              rows={2}
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#3454FB]/20 resize-none"
              {...register("description")}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Class Color</Label>

            <div className="flex flex-wrap gap-2.5 pt-0.5">
              {activePalette.map((c) => {
                const isSelected =
                  selectedColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    className={cn(
                      "relative h-8 w-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer",
                      isSelected
                        ? "scale-110 ring-2 ring-offset-2 ring-slate-800 shadow-sm"
                        : "hover:scale-105 opacity-85 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                    aria-label={`Select color ${c}`}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-white stroke-[3] drop-shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Capacity Limit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Student Capacity Limit
              </Label>
              <span className="text-[11px] text-slate-500 font-medium">
                {hasLimit ? `${limitValue || 0} students max` : "No limit (unlimited)"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
              <button
                type="button"
                onClick={() => setHasLimit(false)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  !hasLimit
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Infinity className="h-3.5 w-3.5 text-[#3454FB]" />
                <span>No limit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasLimit(true);
                  if (!limitValue || limitValue === 0) setLimitValue(30);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                  hasLimit
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Set limit</span>
              </button>
            </div>

            {hasLimit && (
              <div className="space-y-1 pt-1">
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={5000}
                    placeholder="e.g. 30"
                    value={limitValue}
                    onChange={(e) => setLimitValue(e.target.value)}
                    className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#3454FB]/20 pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                    students
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Once reached, new students will not be able to join this class.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-9 px-4 shadow-none"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {isSaving
                ? isEdit
                  ? "Saving changes..."
                  : "Creating class..."
                : isEdit
                  ? "Save Changes"
                  : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
