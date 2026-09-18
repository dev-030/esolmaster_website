"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Check, ClipboardList, Clock, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { addTasksToClass, scheduleClassTask, useGetScheduledTasksForClassQuery } from "@/api/class";
import { useGetTasks } from "@/api/task";
import { ClassTaskWithClass } from "@/types/class";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRole } from "@/provider/RoleProvider";
import { useTeacherSubscription } from "@/provider/SubscriptionProvider";
import { TaskRow } from "./TaskRow";

const TaskListSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-[18px] border border-slate-100 bg-white p-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-44 rounded-md bg-slate-200/70" />
                <div className="h-4 w-14 rounded-full bg-slate-100" />
              </div>
              <div className="h-3 w-32 rounded-md bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-20 rounded-md bg-slate-100" />
            <div className="h-8 w-24 rounded-[10px] bg-slate-100" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const TaskMainPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { role } = useRole();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueAt, setDueAt] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Extend deadline state (Google Classroom style)
  const [extendTask, setExtendTask] = useState<ClassTaskWithClass | null>(null);
  const [newDueAt, setNewDueAt] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  const { data: scheduledTasks, isLoading, refetch } = useGetScheduledTasksForClassQuery(classId);
  const { data: library } = useGetTasks({ page: 1, limit: 100 });

  const isTeacher = role === "teacher";
  const { limits, planType, openUpgradeModal } = useTeacherSubscription();
  const currentTasksCount = scheduledTasks?.length ?? 0;
  const maxTasks = limits.maxScheduledTasksInClass;
  const remainingTasks = Math.max(0, maxTasks - currentTasksCount);
  const isTasksFull = remainingTasks <= 0;

  const assignedTaskIds = useMemo(
    () => new Set((scheduledTasks ?? []).map((item) => item.task.id)),
    [scheduledTasks],
  );
  const availableTasks = (library?.data ?? []).filter((task) => !assignedTaskIds.has(task.id));

  const closeDialog = () => {
    setIsLibraryOpen(false);
    setSelectedTaskId("");
    setHasDueDate(false);
    setDueAt("");
  };

  const openExtendTime = (task: ClassTaskWithClass) => {
    setExtendTask(task);
    if (task.scheduled?.dueAt) {
      const d = new Date(task.scheduled.dueAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      setNewDueAt(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 0, 0);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getDate()).padStart(2, "0");
      setNewDueAt(`${year}-${month}-${day}T23:59`);
    }
  };

  const applyPreset = (preset: { hours?: number; days?: number }) => {
    const base =
      extendTask?.scheduled?.dueAt && new Date(extendTask.scheduled.dueAt) > new Date()
        ? new Date(extendTask.scheduled.dueAt)
        : new Date();

    if (preset.hours) {
      base.setHours(base.getHours() + preset.hours);
    }
    if (preset.days) {
      base.setDate(base.getDate() + preset.days);
    }

    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");
    const hours = String(base.getHours()).padStart(2, "0");
    const minutes = String(base.getMinutes()).padStart(2, "0");
    setNewDueAt(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const handleSaveExtension = async () => {
    if (!extendTask) return;
    if (!newDueAt) {
      toast.error("Please select a due date and time");
      return;
    }
    const targetDate = new Date(newDueAt);
    if (targetDate <= new Date()) {
      toast.error("Due date must be in the future");
      return;
    }

    try {
      setIsExtending(true);
      await scheduleClassTask(classId, {
        classTaskId: extendTask.classTaskId,
        dueAt: targetDate.toISOString(),
        isActive: true,
      });
      await refetch();
      setExtendTask(null);
      setNewDueAt("");
      toast.success("Time limit extended successfully");
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to extend deadline";
      toast.error(message || "Failed to extend deadline");
    } finally {
      setIsExtending(false);
    }
  };

  const handleRemoveDeadline = async () => {
    if (!extendTask) return;
    try {
      setIsExtending(true);
      await scheduleClassTask(classId, {
        classTaskId: extendTask.classTaskId,
        dueAt: undefined,
        isActive: true,
      });
      await refetch();
      setExtendTask(null);
      setNewDueAt("");
      toast.success("Due date removed");
    } catch {
      toast.error("Failed to remove due date");
    } finally {
      setIsExtending(false);
    }
  };

  const assignActivity = async () => {
    if (!selectedTaskId) return;
    if (hasDueDate && (!dueAt || new Date(dueAt) <= new Date())) {
      toast.error("Choose a due date in the future");
      return;
    }

    try {
      setIsAssigning(true);
      const classTasks = await addTasksToClass(classId, [selectedTaskId]);
      const classTask = classTasks.find(
        (item: { task: { id: string } }) => item.task.id === selectedTaskId,
      );
      if (!classTask) throw new Error("Activity could not be added to this class");

      await scheduleClassTask(classId, {
        classTaskId: classTask.classTaskId,
        dueAt: hasDueDate ? new Date(dueAt).toISOString() : undefined,
        isActive: true,
      });
      await refetch();
      closeDialog();
      toast.success("Activity assigned");
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : null;
      toast.error(message || "Unable to assign activity");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Activities</h1>
            {isTeacher && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                {currentTasksCount} / {maxTasks} assigned · <strong className="text-slate-800 font-semibold">{remainingTasks}</strong> remaining ({planType})
              </span>
            )}
          </div>
        </div>
        {isTeacher && (
          <div className="flex items-center gap-2">
            {isTasksFull ? (
              <Button
                onClick={() =>
                  openUpgradeModal(
                    "Activity Limit Reached",
                    `You have assigned the maximum of ${maxTasks} activities for this class on your ${planType} plan. Upgrade to assign more activities.`
                  )
                }
                className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-[12px] h-9 px-3.5 text-xs shadow-none cursor-pointer"
              >
                Activity limit reached ({maxTasks}/{maxTasks}) · Upgrade
              </Button>
            ) : (
              <Button
                onClick={() => setIsLibraryOpen(true)}
                className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[12px] h-9 px-4 text-xs shadow-sm shadow-primary/15"
              >
                <Plus className="h-4 w-4" /> Assign activity
              </Button>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <TaskListSkeleton />
      ) : scheduledTasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-100 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">No activities assigned</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {isTeacher ? "Choose a published activity and optionally set a due date." : "Your teacher has not assigned anything yet."}
            </p>
          </div>
          {isTeacher && (
            isTasksFull ? (
              <Button
                onClick={() =>
                  openUpgradeModal(
                    "Activity Limit Reached",
                    `You have assigned the maximum of ${maxTasks} activities for this class on your ${planType} plan. Upgrade to assign more activities.`
                  )
                }
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Upgrade Plan
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsLibraryOpen(true)}>
                Choose an activity
              </Button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledTasks?.map((task) => (
            <TaskRow
              key={task.classTaskId}
              task={task}
              classId={classId}
              isTeacher={isTeacher}
              onExtendTime={openExtendTime}
            />
          ))}
        </div>
      )}

      <Dialog
        open={isLibraryOpen}
        onOpenChange={(open) => {
          if (isAssigning) return;
          if (open) setIsLibraryOpen(true);
          else closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Assign an activity</DialogTitle>
            <DialogDescription>
              Select an activity, then choose whether it needs a due date. ({remainingTasks} of {maxTasks} activities remaining on {planType} plan)
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
            {availableTasks.map((task) => {
              const selected = selectedTaskId === task.id;
              return (
                <button
                  type="button"
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                    selected ? "border-primary bg-primary/5 ring-2 ring-primary/10" : "border-slate-200 hover:border-primary/20 hover:bg-slate-50",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", selected ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                    {selected ? <Check className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-800">{task.title}</span>
                    <span className="block text-xs capitalize text-slate-500">{task.type.toLowerCase()}</span>
                  </span>
                </button>
              );
            })}
            {!availableTasks.length && (
              <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">Every available activity is already assigned.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="has-due-date"
                checked={hasDueDate}
                onCheckedChange={(checked) => {
                  setHasDueDate(checked === true);
                  if (checked && !dueAt) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(23, 59, 0, 0);
                    const year = tomorrow.getFullYear();
                    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
                    const day = String(tomorrow.getDate()).padStart(2, "0");
                    setDueAt(`${year}-${month}-${day}T23:59`);
                  }
                }}
              />
              <Label htmlFor="has-due-date" className="cursor-pointer font-semibold">Set a due date &amp; time limit</Label>
              <span className="ml-auto text-xs text-slate-500">Optional</span>
            </div>
            {hasDueDate && (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="due-at" className="text-xs text-slate-600">Students can submit until</Label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: "Tomorrow", days: 1 },
                      { label: "+3 Days", days: 3 },
                      { label: "+1 Week", days: 7 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setDate(d.getDate() + btn.days);
                          d.setHours(23, 59, 0, 0);
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, "0");
                          const day = String(d.getDate()).padStart(2, "0");
                          setDueAt(`${year}-${month}-${day}T23:59`);
                        }}
                        className="text-[11px] font-medium text-slate-600 hover:text-primary bg-white border border-slate-200 hover:border-primary/40 px-2 py-0.5 rounded-md transition cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="due-at" type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="bg-white pl-9" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isAssigning}>Cancel</Button>
            <Button onClick={assignActivity} disabled={!selectedTaskId || isAssigning}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isAssigning ? "Assigning…" : "Assign activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Extend Due Date / Time Dialog (Google Classroom style) ── */}
      <Dialog
        open={Boolean(extendTask)}
        onOpenChange={(open) => {
          if (isExtending) return;
          if (!open) {
            setExtendTask(null);
            setNewDueAt("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
              <Clock className="h-5 w-5 text-primary" />
              Extend Activity Time Limit
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Increase the deadline for <strong>{extendTask?.task.title}</strong> so students have more time to submit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Current deadline status */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Current deadline:</span>
              <span className="font-semibold text-slate-800">
                {extendTask?.scheduled?.dueAt
                  ? new Date(extendTask.scheduled.dueAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No deadline set"}
              </span>
            </div>

            {/* Quick Extension Presets */}
            <div>
              <Label className="text-xs font-semibold text-slate-700 block mb-2">
                Quick increase:
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "+1 Hour", hours: 1 },
                  { label: "+1 Day", days: 1 },
                  { label: "+3 Days", days: 3 },
                  { label: "+1 Week", days: 7 },
                ].map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="h-8 text-xs font-semibold text-slate-700 hover:text-primary hover:border-primary/40 hover:bg-primary/5 rounded-lg shadow-none cursor-pointer"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Datetime picker */}
            <div className="space-y-1.5">
              <Label htmlFor="extend-due-at" className="text-xs font-semibold text-slate-700">
                New Due Date &amp; Time:
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="extend-due-at"
                  type="datetime-local"
                  value={newDueAt}
                  onChange={(e) => setNewDueAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="bg-white pl-9 h-10 border-slate-200 text-sm focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 flex items-center justify-between sm:justify-between gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveDeadline}
              disabled={isExtending || !extendTask?.scheduled?.dueAt}
              className="text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 h-9 px-3 cursor-pointer"
            >
              Remove deadline
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExtendTask(null)}
                disabled={isExtending}
                className="h-9 text-xs rounded-lg shadow-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveExtension}
                disabled={isExtending || !newDueAt}
                className="h-9 px-4 text-xs font-semibold bg-[#007EEF] hover:bg-[#0066cc] text-white rounded-lg shadow-none border-none cursor-pointer"
                style={{ boxShadow: "none" }}
              >
                {isExtending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                <span>{isExtending ? "Extending…" : "Save Extension"}</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
