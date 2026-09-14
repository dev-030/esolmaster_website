import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";

export interface BadgeItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  completed: boolean;
  progress?: number;
  progressLabel?: string;
  iconColor?: string;
}

export const BadgeCard = ({ badge }: { badge: BadgeItem }) => {
  return (
    <div className="group relative flex flex-col items-center text-center justify-between rounded-[22px] border border-slate-100/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Icon container */}
        <div
          className={`w-14 h-14 rounded-[16px] flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
            badge.completed
              ? "bg-amber-50 border border-amber-200/60 text-amber-500 shadow-sm shadow-amber-500/10"
              : "bg-slate-50 border border-slate-150 text-slate-300"
          }`}
        >
          {badge.completed ? (
            <span className="[&>svg]:w-7 [&>svg]:h-7 text-amber-500">
              {badge.icon}
            </span>
          ) : (
            <Lock className="w-6 h-6 text-slate-400" />
          )}
        </div>

        {/* Title and description */}
        <div>
          <p className="text-sm font-bold text-slate-900 tracking-tight">
            {badge.title}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-2">
            {badge.subtitle}
          </p>
        </div>
      </div>

      {/* Status or Progress */}
      <div className="w-full pt-4 mt-2 border-t border-slate-100 flex justify-center">
        {badge.completed ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlocked
          </span>
        ) : (
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{badge.progressLabel ?? "Progress"}</span>
              <span className="text-slate-700">{badge.progress ?? 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3454FB] rounded-full transition-all duration-500"
                style={{ width: `${badge.progress ?? 0}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};