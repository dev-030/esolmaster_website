"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
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
  maxStudents: z
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .min(1, "At least 1 student")
    .max(500, "Maximum 500 students"),
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
      maxStudents: 30,
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
      reset({
        name: initial?.name ?? "",
        subject: initial?.subject ?? "",
        description: initial?.description ?? "",
        color: initialColor,
        maxStudents: initial?.maxStudents ?? 30,
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
    const cls: CreateClassPayload = {
      name: data.name,
      subject: data.subject,
      description: data.description,
      color: selectedColor || data.color,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
