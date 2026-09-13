import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";
import { statusColor } from "./data";
import { ScheduledTaskOverview } from "@/types/task";
import { format } from "date-fns";
import { useRole } from "@/provider/RoleProvider";
export const ActiveTaskCard = ({ task }: { task: ScheduledTaskOverview }) => {
  const { role } = useRole();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[task.type] ?? "bg-gray-100 text-gray-600"}`}
            >
              {task.type}
            </span>
          </div>
          <p className="font-semibold text-sm text-foreground leading-snug mt-1 truncate">
            {task.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {task.className}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap shrink-0">
          <CalendarDays className="w-3.5 h-3.5" />
          {format(new Date(task.dueAt), "MMM dd, yyyy")}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground">
            {role === "teacher"
              ? task.completedStudents
              : task.answeredQuestions}
            /{role === "teacher" ? task.totalStudents : task.totalQuestions}
          </span>
          <span className="text-[11px] font-semibold text-primary">
            {role === "teacher" ? task.completionRate : task.progressPercentage}
            %
          </span>
        </div>
        <Progress
          value={
            role === "teacher" ? task.completionRate : task.progressPercentage
          }
          className="h-1.5"
        />
      </div>
    </div>
  );
};
