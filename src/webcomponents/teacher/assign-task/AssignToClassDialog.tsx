"use client";

import { useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardList,
  Loader2,
  School,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetClassesQuery, addTasksToClass, scheduleClassTask } from "@/api/class";
import { cn } from "@/lib/utils";

interface AssignToClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
}

export const AssignToClassDialog = ({
  open,
  onOpenChange,
  taskId,
  taskTitle,
}: AssignToClassDialogProps) => {
  const { data: classesData, isLoading } = useGetClassesQuery({ page: 1, limit: 50 });
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [hasDueDate, setHasDueDate] = useState<boolean>(false);
  const [dueAt, setDueAt] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState<boolean>(false);

  const classes = classesData?.data || [];

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class to assign this activity to");
      return;
    }

    if (hasDueDate && !dueAt) {
      toast.error("Please select a due date or uncheck 'Set a due date'");
      return;
    }

    const targetClass = classes.find((c) => c.id === selectedClassId);

    try {
      setIsAssigning(true);
      const classTasks = await addTasksToClass(selectedClassId, [taskId]);
      const classTask = classTasks?.find(
        (item: { task: { id: string } }) => item.task?.id === taskId,
      );

      if (!classTask) {
        throw new Error("Activity could not be linked to the selected class");
      }

      await scheduleClassTask(selectedClassId, {
        classTaskId: classTask.classTaskId,
        dueAt: hasDueDate && dueAt ? new Date(dueAt).toISOString() : undefined,
        isActive: true,
      });

      toast.success(
        `"${taskTitle}" assigned to ${targetClass?.name || "classroom"}!`,
      );
      onOpenChange(false);
      setSelectedClassId("");
      setHasDueDate(false);
      setDueAt("");
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : null;
      toast.error(message || "Unable to assign activity to classroom");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !isAssigning && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xl ring-0">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#3454FB]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800 tracking-tight">
                Assign to Classroom
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">
                Assign &ldquo;{taskTitle}&rdquo; to your students
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Class selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Select Target Classroom
            </Label>

            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#3454FB]" />
                Loading your classrooms...
              </div>
            ) : classes.length === 0 ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-6 text-center text-xs text-slate-500">
                <School className="h-6 w-6 mx-auto mb-1.5 text-slate-400" />
                No classrooms found. Create a class first to assign activities.
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {classes.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "border-[#3454FB] bg-blue-50/40 ring-1 ring-[#3454FB]"
                          : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 bg-white",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: cls.color || "#3454FB" }}
                        >
                          {cls.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {cls.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {cls.subject}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Users className="h-3 w-3" />
                          {cls.studentCount ?? 0}
                        </span>
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-[#3454FB] border-[#3454FB] text-white"
                              : "border-slate-300 bg-white",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Due date card */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="preview-has-due-date"
                  checked={hasDueDate}
                  onCheckedChange={(checked) => setHasDueDate(checked === true)}
                />
                <Label
                  htmlFor="preview-has-due-date"
                  className="cursor-pointer text-xs font-semibold text-slate-700"
                >
                  Set a submission deadline
                </Label>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Optional
              </span>
            </div>

            {hasDueDate && (
              <div className="space-y-1 pt-1">
                <Label
                  htmlFor="preview-due-at"
                  className="text-[11px] font-medium text-slate-500"
                >
                  Due date and time
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    id="preview-due-at"
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
            className="rounded-xl text-xs font-semibold h-9 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedClassId || isAssigning}
            className="rounded-xl bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-9 px-4 shadow-none"
          >
            {isAssigning && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
            {isAssigning ? "Assigning..." : "Assign to Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
