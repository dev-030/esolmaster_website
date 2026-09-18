import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClassTaskWithClass } from "@/types/class";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookA,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  SpellCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

export const TASK_TYPE_CONFIG = {
  grammar: {
    label: "Grammar",
    icon: <SpellCheck />,
    variant: "info" as const,
  },
  reading: {
    label: "Reading",
    icon: <BookOpen />,
    variant: "success" as const,
  },
  vocabulary: {
    label: "Vocabulary",
    icon: <BookA />,
    variant: "warning" as const,
  },
} as const;

export const TaskRow = ({
  task,
  classId,
  isTeacher,
  onExtendTime,
}: {
  task: ClassTaskWithClass;
  classId: string;
  isTeacher: boolean;
  onExtendTime?: (task: ClassTaskWithClass) => void;
}) => {
  const config =
    TASK_TYPE_CONFIG[
      task.task.type.toLowerCase() as keyof typeof TASK_TYPE_CONFIG
    ] ?? TASK_TYPE_CONFIG.reading;

  const isPastDue = Boolean(
    task.scheduled?.dueAt && new Date(task.scheduled.dueAt).getTime() < Date.now()
  );
  const completionRate = task.completionRate || 0;
  const completedText = `${task.completedStudents}/${task.totalStudents}`;
  const isCompleted = !isTeacher && task.status === "COMPLETED";
  const isOverdue = !isTeacher && !isCompleted && isPastDue;
  const actionLabel = isTeacher ? "View results" : isCompleted ? "View score" : task.status === "IN_PROGRESS" ? "Continue" : "Start";

  const formatDeadline = (dueAtStr: string) => {
    const dueDate = new Date(dueAtStr);
    const now = new Date();
    const isPast = dueDate.getTime() < now.getTime();

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const timeStr = dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = dueDate.toLocaleDateString([], { month: "short", day: "numeric" });

    if (isPast) {
      if (isSameDay(dueDate, yesterday)) {
        return `Closed yesterday (${timeStr})`;
      }
      if (isSameDay(dueDate, now)) {
        return `Ended today at ${timeStr}`;
      }
      return `Closed on ${dateStr}`;
    }

    if (isSameDay(dueDate, now)) {
      return `Due today at ${timeStr}`;
    }
    if (isSameDay(dueDate, tomorrow)) {
      return `Due tomorrow at ${timeStr}`;
    }
    return `Due ${dateStr}`;
  };

  return (
    <Card className="group gap-0 py-0 transition-all duration-200 border border-slate-200/80 hover:border-[#007EEF]/30 shadow-none rounded-xl bg-white">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Emoji icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-slate-800">
                {task.task.title}
              </span>
              <Badge
                variant={config.variant}
                className="text-[10px] px-1.5 py-0"
              >
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {task.task.questionCount} question
                {task.task.questionCount !== 1 ? "s" : ""}
              </span>

              {task.scheduled?.dueAt ? (
                isPastDue ? (
                  <button
                    type="button"
                    onClick={() => isTeacher && onExtendTime?.(task)}
                    disabled={!isTeacher}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200/80 transition-colors",
                      isTeacher && "hover:bg-red-100 hover:border-red-300 cursor-pointer"
                    )}
                    title={isTeacher ? "Deadline has passed. Click to extend time limit" : undefined}
                  >
                    <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                    <span>{formatDeadline(task.scheduled.dueAt)}</span>
                    {isTeacher && (
                      <span className="text-[10px] text-red-700 underline underline-offset-2 ml-1 font-bold">
                        Extend
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => isTeacher && onExtendTime?.(task)}
                    disabled={!isTeacher}
                    className={cn(
                      "flex items-center gap-1 text-slate-500",
                      isTeacher && "hover:text-primary cursor-pointer transition-colors"
                    )}
                    title={isTeacher ? "Click to extend or change due date" : undefined}
                  >
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDeadline(task.scheduled.dueAt)}</span>
                    {isTeacher && (
                      <span className="text-[10px] text-primary underline underline-offset-2 ml-0.5">
                        Extend
                      </span>
                    )}
                  </button>
                )
              ) : isTeacher ? (
                <button
                  type="button"
                  onClick={() => onExtendTime?.(task)}
                  className="hover:text-primary cursor-pointer transition-colors text-primary flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  <span>+ Set due date</span>
                </button>
              ) : (
                <span>No due date</span>
              )}
            </div>
            {isCompleted && (
              <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800">{task.score} / {task.totalMarks} marks</span>
                <span className="text-slate-500">· {task.percentage}%</span>
                {task.isPassed === true && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                    ✓ Passed
                  </span>
                )}
                {task.isPassed === false && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[11px] font-bold text-red-600">
                    ✗ Failed
                  </span>
                )}
              </div>
            )}
            {isOverdue && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" /> Submission closed
              </div>
            )}
          </div>

          {/* Right side with progress and actions */}
          <div className="flex items-center gap-3 sm:ml-auto sm:flex-col sm:items-end sm:gap-2">
            {/* Progress section */}
            <div className="min-w-32 flex-1 space-y-1 sm:w-44 sm:flex-none">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-400 font-medium">
                  <Users className="w-3 h-3" />
                  <span>{isTeacher ? "Completion" : isCompleted ? "Your score" : "Your progress"}</span>
                </span>
                <span className="font-semibold text-slate-700">
                  {isTeacher
                    ? completedText
                    : isCompleted
                    ? `${task.score ?? 0} / ${task.totalQuestions ?? 0} marks  ${task.percentage ?? 0}%`
                    : `${task.answeredQuestions}/${task.totalQuestions}`}
                </span>
              </div>
              <Progress value={isTeacher ? completionRate : isCompleted ? task.percentage ?? 0 : task.progressPercentage} className="h-2" />
            </div>

            <div className="flex items-center gap-2">
              {isTeacher && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExtendTime?.(task)}
                  className={cn(
                    "gap-1.5 h-8 text-xs font-semibold rounded-lg shadow-none",
                    isPastDue
                      ? "border-red-200 bg-red-50/50 text-red-700 hover:bg-red-100 hover:border-red-300"
                      : "border-slate-200 text-slate-700 hover:text-primary hover:border-primary/40"
                  )}
                >
                  <Clock className={cn("w-3.5 h-3.5", isPastDue ? "text-red-500" : "text-primary")} />
                  <span>Extend time</span>
                </Button>
              )}

              {!isOverdue && (
                <Link href={`/classes/${classId}/task/${task.scheduled?.id}`}>
                  <Button
                    size="sm"
                    variant={isTeacher ? "ghost" : "default"}
                    className="gap-1.5 h-8"
                  >
                    {actionLabel}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
