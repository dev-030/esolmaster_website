"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRole } from "@/provider/RoleProvider";
import { ClipboardList, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { TaskRow } from "./TaskRow";
import { addTasksToClass, scheduleClassTask, useGetScheduledTasksForClassQuery } from "@/api/class";
import { useGetTasks } from "@/api/task";
import { toast } from "sonner";
import { useState } from "react";

export const TaskMainPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { role } = useRole();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const { data: scheduledTasks, refetch } =
    useGetScheduledTasksForClassQuery(classId);
  const { data: library } = useGetTasks({ page: 1, limit: 100 });

  const isTeacher = role === "teacher";
  const availableTasks = library?.data || [];

  const addAndScheduleTask = async (taskId: string) => {
    try {
      setAddingTaskId(taskId);
      const classTasks = await addTasksToClass(classId, [taskId]);
      const classTask = classTasks.find((item: { task: { id: string } }) => item.task.id === taskId);
      await scheduleClassTask(classId, { classTaskId: classTask.classTaskId, isActive: true });
      await refetch();
      setIsLibraryOpen(false);
      toast.success("Activity assigned to this class");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to assign activity");
    } finally {
      setAddingTaskId(null);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {scheduledTasks?.length ?? 0} ·{" "}
            {scheduledTasks?.length !== 1 ? "tasks" : "task"}
          </p>
        </div>
        {isTeacher && <Button onClick={() => setIsLibraryOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Assign activity</Button>}
      </div>

      {/* Task list */}
      {scheduledTasks?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isTeacher
                ? "Choose a published activity to assign to your students."
                : "No tasks have been assigned yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledTasks?.map((task) => (
            <TaskRow
              key={task.classTaskId}
              task={task}
              classId={classId}
              isTeacher={isTeacher}
              // onEdit={() => setTaskDialog({ open: true, initial: {...task, classTaskId: task.classTaskId} })}
              // onDelete={() =>
              //   setDeleteDialog({ open: true, id: task.classTaskId, title: task.task.title })
              // }
            />
          ))}
        </div>
      )}

      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Assign an activity</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2">
            {availableTasks.map((task: { id: string; title: string; type: string }) => (
              <div key={task.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
                <div><p className="font-medium text-slate-800">{task.title}</p><p className="text-xs text-slate-500 capitalize">{task.type.toLowerCase()}</p></div>
                <Button size="sm" onClick={() => addAndScheduleTask(task.id)} disabled={addingTaskId === task.id}>{addingTaskId === task.id ? "Assigning..." : "Assign"}</Button>
              </div>
            ))}
            {!availableTasks.length && <p className="py-8 text-center text-sm text-slate-500">No published activities are available.</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      {/* <TaskDialog
        open={taskDialog.open}
        onOpenChange={(v) => setTaskDialog((s) => ({ ...s, open: v }))}
        initial={taskDialog.initial}
        onSave={(task) => {
          if (taskDialog.initial) updateTask(task.id, task);
          else addTask(task);
        }}
      /> */}

      {/* <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(v) => setDeleteDialog((s) => ({ ...s, open: v }))}
        title={`Delete "${deleteDialog.title}"?`}
        description="This will permanently remove the task and all its questions."
        onConfirm={() => {
          if (deleteDialog.id) {
            toast.success("Task deleted");
          }
        }}
      /> */}
    </div>
  );
};
