import {
  BookOpen,
  FileText,
  Languages,
  SpellCheck,
  Zap,
} from "lucide-react";
import { typeColor } from "./data";
import { RecentActivity as RecentActivityInterface } from "@/types/student";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity = ({
  items,
}: {
  items: RecentActivityInterface[];
}) => (
  <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Recent Activity
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Your recently completed tasks and activities
        </p>
      </div>
    </div>

    {items.length === 0 ? (
      <div className="py-12 text-center text-xs text-slate-400 font-medium">
        No recent activity yet. Start a task to see your progress here!
      </div>
    ) : (
      <div className="divide-y divide-slate-100">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50/80 text-[#3454FB]">
              {item.taskType === "GRAMMAR" ? (
                <SpellCheck className="w-5 h-5" />
              ) : item.taskType === "READING" ? (
                <BookOpen className="w-5 h-5" />
              ) : item.taskType === "VOCABULARY" ? (
                <Languages className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {item.taskTitle}
              </p>
              <span
                className={`inline-block text-[11px] font-semibold mt-0.5 ${
                  typeColor[item.taskType] ?? "text-slate-400"
                }`}
              >
                {item.taskType}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3454FB] bg-blue-50 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3 fill-[#3454FB]" />
                +{item.xpEarned} XP
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
