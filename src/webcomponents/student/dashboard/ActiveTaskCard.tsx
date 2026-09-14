import { Progress } from "@/components/ui/progress";
import { CalendarDays, ArrowRight } from "lucide-react";
import { statusColor } from "./data";
import { ScheduledTaskOverview } from "@/types/task";
import { format } from "date-fns";
import { useRole } from "@/provider/RoleProvider";
import Link from "next/link";

export const ActiveTaskCard = ({ task }: { task: ScheduledTaskOverview }) => {
  const { role } = useRole();
  const isCompleted = task.progressPercentage === 100;

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-[18px] border border-slate-150/70 bg-slate-50/40 hover:bg-white hover:border-[#3454FB]/30 p-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                statusColor[task.type] ?? "bg-blue-50 text-[#3454FB] border border-blue-100"
              }`}
            >
              {task.type}
            </span>
          </div>
          <p className="font-bold text-sm text-slate-900 leading-snug mt-1 truncate group-hover:text-[#3454FB] transition-colors">
            {task.title}
          </p>
          <p className="text-xs text-slate-400 line-clamp-1 font-medium">
            {task.className}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap shrink-0">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          {task.dueAt ? format(new Date(task.dueAt), "MMM dd") : "No due date"}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            {role === "teacher" ? task.completedStudents : task.answeredQuestions}
            /{role === "teacher" ? task.totalStudents : task.totalQuestions} questions
          </span>
          <span className="text-xs font-bold text-[#3454FB]">
            {role === "teacher" ? task.completionRate : task.progressPercentage}%
          </span>
        </div>

        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3454FB] rounded-full transition-all duration-500"
            style={{
              width: `${role === "teacher" ? task.completionRate : task.progressPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
