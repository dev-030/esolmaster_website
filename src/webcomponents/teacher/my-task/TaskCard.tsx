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
  [TaskType.GRAMMAR]: {
    label: "Grammar",
    icon: Type,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [TaskType.READING]: {
    label: "Reading",
    icon: BookOpen,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  [TaskType.VOCABULARY]: {
    label: "Vocabulary",
    icon: Languages,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

// ── Link logic ────────────────────────────────────────────────────────────────
function getTaskLink(task: Task): string {
  // Simple and direct: open the new Activity Builder with this task ID
  return `/assign-task?taskId=${task.id}`;
}

export const TaskCard = ({ task }: { task: Task }) => {
  const cfg = TASK_TYPE_CONFIG[task.type];
  const classes = task.classes ?? [];
  const href = getTaskLink(task);
  const { role } = useRole();
  const router = useRouter();
  const { mutate: approveTask, isPending } = useApproveTaskMutation();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTaskMutation();

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

  // Extract the icon component from config
  const TypeIcon = cfg.icon;

  return (
    <div 
      onClick={() => router.push(href)}
      className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 hover:shadow-sm transition-all duration-200 group cursor-pointer"
    >
      {/* Left content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Row 1 — type badge with Lucide Icon */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold",
            cfg.badge,
          )}
        >
          <TypeIcon className="w-3 h-3" />
          {cfg.label}
        </span>

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
