import { ActivityType, RecentActivity } from "@/types/admin";
import { Award, CheckCircle2, Clock, Inbox, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "TASK_COMPLETED":
      return <CheckCircle2 size={15} className="text-emerald-600" />;
    case "LEVEL_UP":
      return <TrendingUp size={15} className="text-primary" />;
    case "BADGE_EARNED":
      return <Award size={15} className="text-amber-600" />;
    default:
      return <Clock size={15} className="text-slate-400" />;
  }
};

const getActivityBgColor = (type: ActivityType) => {
  switch (type) {
    case "TASK_COMPLETED":
      return "bg-emerald-50 border-emerald-200/60";
    case "LEVEL_UP":
      return "bg-primary/10 border-primary/25";
    case "BADGE_EARNED":
      return "bg-amber-50 border-amber-200/60";
    default:
      return "bg-slate-100 border-slate-200/60";
  }
};

export const RecentActivityPanel = ({
  activities,
  isLoading,
}: {
  activities: RecentActivity[];
  isLoading?: boolean;
}) => {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900">
            Recent Activity
          </h3>
        </div>
      </div>

      {/* Activity list */}
      <div className="flex flex-col gap-3.5 flex-1 min-h-[220px]">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-slate-100 shrink-0" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3.5 w-24 bg-slate-100" />
                  <Skeleton className="h-4 w-12 rounded-md bg-slate-100" />
                </div>
                <Skeleton className="h-3 w-44 bg-slate-100" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center my-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 border border-slate-200/60">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">No recent activity</p>
              <p className="text-xs text-slate-400 mt-0.5">Platform updates will appear here.</p>
            </div>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${getActivityBgColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-[13px] font-semibold text-slate-900 truncate">
                    {activity.name}
                  </span>
                  {activity.xpEarned > 0 && (
                    <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0">
                      +{activity.xpEarned} XP
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 leading-snug line-clamp-2">
                  {activity.message}
                </span>
                <span className="text-[11px] text-slate-400 capitalize mt-0.5">
                  {activity.type.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
