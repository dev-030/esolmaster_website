import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task, TaskType } from "@/types/task";
import {
  ArrowRight,
  BookOpen,
  Languages,
  LucideIcon,
  School,
  Type,
  Trash2,
  PenTool,
  Headphones,
  Mic,
  Award,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useApproveTaskMutation, useDeleteTaskMutation } from "@/api/task";
import { toast } from "sonner";
import { useRole } from "@/provider/RoleProvider";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TASK_TYPE_CONFIG: Record<
  TaskType,
  { label: string; icon: LucideIcon; badge: string }
> = {
  [TaskType.READING]: {
    label: "Reading",
    icon: BookOpen,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [TaskType.WRITING]: {
    label: "Writing",
    icon: PenTool,
    badge: "bg-purple-50 text-purple-700 border-purple-200",
  },
  [TaskType.LISTENING]: {
    label: "Listening",
    icon: Headphones,
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  [TaskType.SPEAKING]: {
    label: "Speaking",
    icon: Mic,
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
  [TaskType.GRAMMAR]: {
    label: "Grammar",
    icon: Type,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [TaskType.VOCABULARY]: {
    label: "Vocabulary",
    icon: Languages,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

// ── Link logic ────────────────────────────────────────────────────────────────
function getTaskLink(task: Task): string {
  return `/assign-task?taskId=${task.id}`;
}

export const TaskCard = ({ task }: { task: Task }) => {
  const cfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG[TaskType.GRAMMAR];
  const classes = task.classes ?? [];
  const href = getTaskLink(task);
  const { role } = useRole();
  const router = useRouter();
  const { mutate: approveTask, isPending } = useApproveTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const awardingBody = task.readingContent?.awardingBody;
  const entryLevel = task.readingContent?.entryType?.[0] || task.grammarContent?.entryType?.[0];

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    approveTask(task.id, {
      onSuccess: () => {
        toast.success("Task approved successfully!");
      },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id, {
      onSuccess: () => {
        toast.success("Task deleted successfully!");
        setIsAlertOpen(false);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Failed to delete task.";
        toast.error(typeof msg === "string" ? msg : "Failed to delete task.");
        setIsAlertOpen(false);
      }
    });
  };

  const TypeIcon = cfg.icon;

  return (
    <div 
      onClick={() => router.push(href)}
      className="relative group flex flex-col justify-between p-4.5 bg-white border border-slate-200 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-200 transition-all duration-300 cursor-pointer h-full overflow-hidden gap-2.5 min-h-[120px]"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top row: Badges + Delete action */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold",
              cfg.badge,
            )}
          >
            <TypeIcon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>

          {awardingBody && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900 text-white text-[9px] font-bold">
              <Award className="w-2.5 h-2.5" />
              {awardingBody}
            </span>
          )}

          {entryLevel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-semibold">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
          {role !== "admin" && (
            <Badge variant={task.status === "APPROVED" ? "success" : "warning"} className="capitalize text-[10px] px-1.5 py-0">
              {task.status.replace(/_/g, " ").toLowerCase()}
            </Badge>
          )}

          {task.status === "PENDING_APPROVAL" && role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={handleApprove}
              disabled={isPending || task.status !== "PENDING_APPROVAL"}
            >
              {task.status === "PENDING_APPROVAL" ? "Approve" : "Approved"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                task.folderId
                  ? `/assign-task/preview/${task.id}?folderId=${task.folderId}`
                  : `/assign-task/preview/${task.id}`,
              );
            }}
            title="Preview Activity"
            className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger
              onClick={(e) => {
                e.stopPropagation();
                setIsAlertOpen(true);
              }}
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isDeleting}
                  className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer transition-colors"
                />
              }
            >
              <Trash2 className="w-3.5 h-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the task
                  and remove it from all assigned classes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeleting} 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAlertOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <Button 
                  type="button" 
                  disabled={isDeleting} 
                  onClick={handleDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Middle row: Activity Title */}
      <div className="relative z-10 my-0.5">
        <h4 className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2" title={task.title}>
          {task.title}
        </h4>
      </div>

      {/* Bottom row: Classes info */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 relative z-10 pt-1.5 border-t border-slate-100">
        <School className="w-3 h-3 shrink-0 text-slate-400" />
        {classes.length > 0 ? (
          <span className="text-slate-600 font-medium truncate text-[11px]">
            {classes.map(c => c.name).join(", ")}
          </span>
        ) : (
          <span className="italic text-slate-400 text-[11px]">No classes assigned</span>
        )}
      </div>
    </div>
  );
};
