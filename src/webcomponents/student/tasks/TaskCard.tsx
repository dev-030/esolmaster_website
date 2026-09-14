// TaskCard.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrowseTask } from "@/types/student";
import { TaskType } from "@/types/task";
import { ArrowRight, BookOpen, Clock, HelpCircle, Languages, LucideIcon, PencilLine, Zap } from "lucide-react";
import Link from "next/link";

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
    border: "border-emerald-100",
    text: "text-emerald-700",
  },
  WRITING: {
    label: "Writing",
    icon: PencilLine,
    badgeVariant: "info",
    bg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-700",
  },
  LISTENING: {
    label: "Listening",
    icon: Zap,
    badgeVariant: "info",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    text: "text-cyan-700",
  },
  SPEAKING: {
    label: "Speaking",
    icon: HelpCircle,
    badgeVariant: "info",
    bg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-700",
  },
  GRAMMAR: {
    label: "Grammar",
    icon: PencilLine,
    badgeVariant: "info",
    bg: "bg-blue-50",
    border: "border-blue-100",
    text: "text-[#3454FB]",
  },
  VOCABULARY: {
    label: "Vocabulary",
    icon: Languages,
    badgeVariant: "warning",
    bg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-700",
  },
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "MCQ",
  GAP_FILL: "Gap Fill",
  QUESTION_ANSWER: "Q&A",
  MATCHING: "Matching",
};

function formatDue(dueDate?: string): string {
  if (!dueDate) return "No deadline";
  const d = new Date(dueDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    <div className="group flex flex-col justify-between rounded-[20px] border border-slate-100/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="space-y-3">
        {/* Top: Category pill + icon */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
              cfg.bg,
              cfg.border,
              cfg.text
            )}
          >
            <cfg.icon className="w-3 h-3" />
            {cfg.label}
          </span>

          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3 fill-amber-500" />
            {task.totalXp} XP
          </span>
        </div>

        {/* Title and class info */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-[#3454FB] transition-colors">
            {task.taskTitle}
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1">
            {task.className} &middot; {task.classSubject}
          </p>
        </div>

        {/* Question Type badges */}
        {questionTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {questionTypes.map((qt) => (
              <span
                key={qt}
                className="inline-flex items-center px-2 py-0.5 rounded-md border border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-600"
              >
                {QUESTION_TYPE_LABELS[qt] || qt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1 truncate">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {formatDue(task.dueAt)}
          </span>
          <span className="flex items-center gap-1 shrink-0 font-bold text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {task.totalQuestions} questions
          </span>
        </div>

        <Link href={`/classes/${task.classId}/task/${task.scheduledTaskId}`} className="block">
          <Button
            size="sm"
            className="w-full gap-1.5 rounded-[12px] bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-9 shadow-sm shadow-blue-500/15 group-hover:gap-2.5 transition-all duration-150 cursor-pointer"
          >
            {task.attemptStatus === "COMPLETED"
              ? "View results"
              : task.attemptStatus === "IN_PROGRESS"
              ? "Continue task"
              : "Start task"}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};