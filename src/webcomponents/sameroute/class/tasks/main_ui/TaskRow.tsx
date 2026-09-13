import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/provider/RoleProvider";
import { ClassTaskWithClass } from "@/types/class";
import {
  ArrowRight,
  BookA,
  BookOpen,
  Clock,
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
    ];

  const completionRate = task.completionRate || 0;
  const completedText = `${task.completedStudents}/${task.totalStudents}`;

  return (
    <Card className="group hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Emoji icon */}
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl shrink-0 mt-0.5">
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

            <span className="text-xs text-gray-500">{task?.class?.name}</span>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {task.task.questionCount} question
                {task.task.questionCount !== 1 ? "s" : ""}
              </span>

              {task.scheduled?.dueAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due {new Date(task.scheduled.dueAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Right side with progress and actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Progress section */}
            <div className="w-48 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>Completion</span>
                </span>
                <span className="font-medium text-foreground">
                  {isTeacher ? completedText : `${task.answeredQuestions}/${task.totalQuestions}`}
                </span>
              </div>
              <Progress value={isTeacher ? completionRate : task.progressPercentage} className="h-2" />
            </div>

            {/* Action button */}
            <Link href={`/classes/${classId}/task/${task.scheduled?.id}`}>
              <Button
                size="sm"
                variant={isTeacher ? "ghost" : "default"}
                className="gap-1.5 h-8"
              >
                {isTeacher ? "Review results" : "Start"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
