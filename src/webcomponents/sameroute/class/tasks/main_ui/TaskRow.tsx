import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClassTaskWithClass } from "@/types/class";
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
}: {
  task: ClassTaskWithClass;
  classId: string;
  isTeacher: boolean;
}) => {
  const config =
    TASK_TYPE_CONFIG[
      task.task.type.toLowerCase() as keyof typeof TASK_TYPE_CONFIG
    ] ?? TASK_TYPE_CONFIG.reading;

  const completionRate = task.completionRate || 0;
  const completedText = `${task.completedStudents}/${task.totalStudents}`;
  const isCompleted = !isTeacher && task.status === "COMPLETED";
  const isOverdue = !isTeacher && task.status === "OVERDUE";
  const actionLabel = isTeacher ? "View results" : isCompleted ? "View score" : task.status === "IN_PROGRESS" ? "Continue" : "Start";

  return (
    <Card className="group gap-0 py-0 transition-all duration-200 hover:border-blue-200 hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Emoji icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">
                {task.task.title}
              </span>
              <Badge
                variant={config.variant}
                className="text-[10px] px-1.5 py-0"
              >
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {task.task.questionCount} question
                {task.task.questionCount !== 1 ? "s" : ""}
              </span>

              {task.scheduled?.dueAt && (
                <span className={`flex items-center gap-1 ${isOverdue ? "font-medium text-red-600" : ""}`}>
                  <Clock className="w-3 h-3" />
                  Due {new Date(task.scheduled.dueAt).toLocaleDateString()}
                </span>
              )}
              {!task.scheduled?.dueAt && <span>No due date</span>}
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
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{isTeacher ? "Completion" : isCompleted ? "Your score" : "Your progress"}</span>
                </span>
                <span className="font-medium text-foreground">
                  {isTeacher
                    ? completedText
                    : isCompleted
                    ? `${task.score ?? 0} / ${task.totalQuestions ?? 0} marks  ${task.percentage ?? 0}%`
                    : `${task.answeredQuestions}/${task.totalQuestions}`}
                </span>
              </div>
              <Progress value={isTeacher ? completionRate : isCompleted ? task.percentage ?? 0 : task.progressPercentage} className="h-2" />
            </div>

            {!isOverdue && <Link href={`/classes/${classId}/task/${task.scheduled?.id}`}>
              <Button
                size="sm"
                variant={isTeacher ? "ghost" : "default"}
                className="gap-1.5 h-8"
              >
                {actionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
