"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Check, ClipboardList, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { addTasksToClass, scheduleClassTask, useGetScheduledTasksForClassQuery } from "@/api/class";
import { useGetTasks } from "@/api/task";
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
import { TaskRow } from "./TaskRow";

export const TaskMainPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { role } = useRole();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueAt, setDueAt] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const { data: scheduledTasks, isLoading, refetch } = useGetScheduledTasksForClassQuery(classId);
  const { data: library } = useGetTasks({ page: 1, limit: 100 });

  const isTeacher = role === "teacher";
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
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Activities</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">{scheduledTasks?.length ?? 0} assigned to this class</p>
        </div>
        {isTeacher && (
          <Button
            onClick={() => setIsLibraryOpen(true)}
            className="gap-2 bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold rounded-[12px] h-9 px-4 text-xs shadow-sm shadow-blue-500/15"
          >
            <Plus className="h-4 w-4" /> Assign activity
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
      ) : scheduledTasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No activities assigned</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isTeacher ? "Choose a published activity and optionally set a due date." : "Your teacher has not assigned anything yet."}
            </p>
          </div>
          {isTeacher && <Button variant="outline" onClick={() => setIsLibraryOpen(true)}>Choose an activity</Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledTasks?.map((task) => <TaskRow key={task.classTaskId} task={task} classId={classId} isTeacher={isTeacher} />)}
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
            <DialogDescription>Select an activity, then choose whether it needs a due date.</DialogDescription>
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
                    selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-200 hover:bg-slate-50",
                  )}
                >
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                    {selected ? <Check className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900">{task.title}</span>
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
              <Checkbox id="has-due-date" checked={hasDueDate} onCheckedChange={(checked) => setHasDueDate(checked === true)} />
              <Label htmlFor="has-due-date" className="cursor-pointer font-semibold">Set a due date</Label>
              <span className="ml-auto text-xs text-slate-500">Optional</span>
            </div>
            {hasDueDate && (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="due-at" className="text-xs text-slate-600">Students can submit until</Label>
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
    </div>
  );
};
