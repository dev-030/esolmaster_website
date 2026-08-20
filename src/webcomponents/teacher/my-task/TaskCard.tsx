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
      },
      onError: () => {
        toast.error("Failed to delete task.");
      }
    });
  };

  const TypeIcon = cfg.icon;

  return (
    <div 
      onClick={() => router.push(href)}
      className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 hover:shadow-sm transition-all duration-200 group cursor-pointer bg-white"
    >
      {/* Left content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Row 1 — badges (Skill + Awarding Body + Level) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold",
              cfg.badge,
            )}
          >
            <TypeIcon className="w-3 h-3" />
            {cfg.label}
          </span>

          {awardingBody && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-bold">
              <Award className="w-2.5 h-2.5" />
              {awardingBody}
            </span>
          )}

          {entryLevel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}
        </div>

        {/* Row 2 — task title */}
        <p className="text-sm font-semibold text-foreground leading-snug truncate">
          {task.title}
        </p>

        {/* Row 3 — class names */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <School className="w-3 h-3 text-muted-foreground shrink-0" />
          {classes.length > 0 ? (
            classes.map((cls, i) => (
              <span key={cls.id} className="text-[11px] text-muted-foreground">
                {cls.name}
                {i < classes.length - 1 && (
                  <span className="mx-1 text-border">·</span>
                )}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-muted-foreground/60 italic">
              No classes assigned
            </span>
          )}
        </div>
      </div>

      {/* Right — CTA button */}
      <div className="flex items-center gap-2">
        { role!== 'admin' &&
          <Badge variant={task.status === "APPROVED" ? "success" : "warning"} className="capitalize">
            {task.status.replace(/_/g, " ").toLowerCase()}
          </Badge>
        }
        {task.status === "PENDING_APPROVAL" && role === "admin" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={isPending || task.status !== "PENDING_APPROVAL"}
          >
            {task.status === "PENDING_APPROVAL" ? "Approve" : "Approved"}
          </Button>
        )}
        
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-600 hover:bg-red-50/50"
              />
            }
          >
            <Trash2 className="w-4 h-4" />
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
              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
