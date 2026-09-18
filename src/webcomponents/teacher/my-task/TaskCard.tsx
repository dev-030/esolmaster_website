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
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useApproveTaskMutation, useDeleteTaskMutation } from "@/api/task";
import { toast } from "sonner";
import { useRole } from "@/provider/RoleProvider";
import { useTeacherSubscription } from "@/provider/SubscriptionProvider";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
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
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  },
  [TaskType.WRITING]: {
    label: "Writing",
    icon: PenTool,
    badge: "bg-purple-50 text-purple-700 border-purple-200/70",
  },
  [TaskType.LISTENING]: {
    label: "Listening",
    icon: Headphones,
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200/70",
  },
  [TaskType.SPEAKING]: {
    label: "Speaking",
    icon: Mic,
    badge: "bg-rose-50 text-rose-700 border-rose-200/70",
  },
  [TaskType.GRAMMAR]: {
    label: "Grammar",
    icon: Type,
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  [TaskType.VOCABULARY]: {
    label: "Vocabulary",
    icon: Languages,
    badge: "bg-amber-50 text-amber-700 border-amber-200/70",
  },
};

const TASK_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "border-amber-200/70 bg-amber-50 text-amber-700" },
  PENDING_APPROVAL: { label: "Pending review", className: "border-violet-200/70 bg-violet-50 text-violet-700" },
  APPROVED: { label: "Published", className: "border-emerald-200/70 bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archived", className: "border-slate-200/70 bg-slate-100 text-slate-600" },
  REJECTED: { label: "Rejected", className: "border-red-200/70 bg-red-50 text-red-700" },
};

// ── Link logic ────────────────────────────────────────────────────────────────
function getTaskLink(task: Task): string {
  return `/assign-task?taskId=${task.id}`;
}

export const TaskCard = ({ task }: { task: Task }) => {
  const cfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG[TaskType.GRAMMAR];
  const classes = task.classes ?? [];
  const { role } = useRole();
  const searchParams = useSearchParams();
  const currentFolderId = task.folderId || searchParams.get("folderId") || undefined;
  const previewHref = currentFolderId
    ? `/assign-task/preview/${task.id}?folderId=${currentFolderId}`
    : `/assign-task/preview/${task.id}`;
  const isAdmin = role === "admin";
  const href = isAdmin ? getTaskLink(task) : previewHref;
  const router = useRouter();
  const { mutate: approveTask, isPending } = useApproveTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { isPremiumTaskAllowed } = useTeacherSubscription();
  const isTeacher = role === "teacher";
  const isTaskAllowed = !task.isPremium || !isTeacher || isPremiumTaskAllowed(task.id);

  const awardingBody = task.readingContent?.awardingBody;
  const entryLevel = task.readingContent?.entryType?.[0] || task.grammarContent?.entryType?.[0];
  const status = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.DRAFT;

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
      onClick={() => href && router.push(href)}
      className="relative group flex flex-col justify-between p-4 bg-white border border-slate-200/70 rounded-xl hover:border-slate-300 transition-colors h-full overflow-hidden gap-2.5 min-h-[120px] cursor-pointer"
    >
      {/* Top row: Badges + Delete action */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium",
              cfg.badge,
            )}
          >
            <TypeIcon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>

          {awardingBody && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70 text-[10px] font-medium">
              <Award className="w-2.5 h-2.5 text-slate-500" />
              {awardingBody}
            </span>
          )}

          {entryLevel && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 text-[10px] font-medium">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}

          {task.isPremium && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              PRO
            </span>
          )}

          {task.isPremium && isTeacher && !isTaskAllowed && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium" title="Upgrade plan to unlock">
              <Lock className="w-2.5 h-2.5 text-slate-500" />
              Locked
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 -mt-0.5 -mr-1">
          <Badge variant="outline" className={cn("text-[10px] font-medium px-1.5 py-0 rounded-md", status.className)}>
            {status.label}
          </Badge>

          {task.status === "PENDING_APPROVAL" && role === "admin" && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 rounded-md border border-slate-200/80 font-medium"
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
              router.push(previewHref);
            }}
            title="Preview Activity"
            className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {isAdmin && (
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
                    className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                  />
                }
              >
                <Trash2 className="w-3.5 h-3.5" />
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()} className="rounded-xl border border-slate-200/70 bg-white p-5 sm:p-6 shadow-none">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base font-semibold text-slate-900">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs sm:text-[13px] text-slate-500">
                    This action cannot be undone. This will permanently delete the task
                    and remove it from all assigned classes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                  <AlertDialogCancel 
                    disabled={isDeleting} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAlertOpen(false);
                    }}
                    className="h-9 px-3.5 rounded-lg border border-slate-200/80 bg-white text-slate-700 text-xs sm:text-[13px] font-medium hover:bg-slate-50 shadow-none cursor-pointer"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button 
                    type="button" 
                    disabled={isDeleting} 
                    onClick={handleDelete} 
                    className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-[13px] font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-none"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Middle row: Activity Title */}
      <div className="relative z-10 my-0.5">
        <h4 className="text-[13px] font-semibold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2" title={task.title}>
          {task.title}
        </h4>
      </div>

      {/* Bottom row: Classes info */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 relative z-10 pt-2 border-t border-slate-100">
        <School className="w-3 h-3 shrink-0 text-slate-400" />
        {classes.length > 0 ? (
          <span className="text-slate-600 font-medium truncate text-[11px]">
            {classes.map(c => c.name).join(", ")}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">No classes assigned</span>
        )}
      </div>
    </div>
  );
};
