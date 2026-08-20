// TaskCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BrowseTask } from "@/types/student";
import { TaskType } from "@/types/task";
import { ArrowRight, BookOpen, Clock, HelpCircle, Languages, LucideIcon, PencilLine, Zap } from "lucide-react";
import Link from "next/link";

const TASK_XP = 50;

export const TASK_TYPE_CONFIG: Record<TaskType, {
  label: string;
  icon: LucideIcon;
  badgeVariant: "info" | "success" | "warning";
  bg: string;
  border: string;
  text: string;
}> = {
  READING: {
    label: "Reading",
    icon: BookOpen,
    badgeVariant: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  WRITING: {
    label: "Writing",
    icon: PencilLine,
    badgeVariant: "info",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  LISTENING: {
    label: "Listening",
    icon: Zap,
    badgeVariant: "info",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
  },
  SPEAKING: {
    label: "Speaking",
    icon: HelpCircle,
    badgeVariant: "info",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
  },
  GRAMMAR: {
    label: "Grammar",
    icon: PencilLine,
    badgeVariant: "info",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  VOCABULARY: {
    label: "Vocabulary",
    icon: Languages,
    badgeVariant: "warning",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ",
  GAP_FILL: "Gap Fill",
  QUESTION_ANSWER: "Q&A",
  MATCHING: "Matching",
};

const QUESTION_TYPE_COLORS: Record<string, string> = {
  MCQ: "bg-violet-100 text-violet-700 border-violet-200",
  GAP_FILL: "bg-sky-100 text-sky-700 border-sky-200",
  QUESTION_ANSWER: "bg-rose-100 text-rose-700 border-rose-200",
  MATCHING: "bg-teal-100 text-teal-700 border-teal-200",
};

function formatDue(dueDate?: string): string {
  if (!dueDate) return "No deadline";
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export const TaskCard = ({ task }: { task: BrowseTask }) => {
  const cfg = TASK_TYPE_CONFIG[task.taskType as TaskType] || {
    label: "Unknown",
    icon: HelpCircle,
    badgeVariant: "info",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  };
  const questionTypes = task.questionTypes || [];

  return (
    <Card className="group flex flex-col hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardContent className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1">
              {task.taskTitle}
            </h3>
            <span className="text-base shrink-0">{cfg.icon && <cfg.icon className="w-4 h-4" />}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {task.className} • {task.classSubject}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {questionTypes.map((qt) => (
            <span
              key={qt}
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold",
                QUESTION_TYPE_COLORS[qt] || "bg-gray-100 text-gray-700 border-gray-200"
              )}
            >
              {QUESTION_TYPE_LABELS[qt] || qt}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Zap className="w-3 h-3" />
            {task.totalXp} XP
          </span>

          <span className="flex items-center gap-1 truncate">
            <Clock className="w-3 h-3 shrink-0" />
            {formatDue(task.dueAt)}
          </span>

          <span className="flex items-center gap-1 ml-auto shrink-0">
            <HelpCircle className="w-3 h-3" />
            {task.totalQuestions}Q
          </span>
        </div>

        <Link href={`/classes/${task.classId}/task/${task.scheduledTaskId}`} className="block">
          <Button
            size="sm"
            className="w-full gap-1.5 group-hover:gap-2.5 transition-all duration-150"
          >
            {task.attemptStatus === "COMPLETED" ? "Show Results" : task.attemptStatus === "IN_PROGRESS" ? "Continue" : "Start"}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};