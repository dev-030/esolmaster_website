import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  trend?: string;
  trendUp?: boolean;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  isLoading?: boolean;
}

export const StatCard = ({
  label,
  value,
  sub,
  trend,
  trendUp,
  icon: Icon,
  iconBg = "bg-slate-50 text-slate-600 border border-slate-200/60",
  iconColor = "text-slate-600",
  isLoading = false,
}: StatCardProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="h-7 w-20 bg-slate-100 rounded animate-pulse mt-2.5" />
        <div className="h-3 w-28 bg-slate-100 rounded animate-pulse mt-2.5" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-slate-900 tracking-tight mt-2">{value}</p>
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium ${
              trendUp
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border border-rose-200/60"
            }`}
          >
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trend}
          </span>
        )}
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
    </div>
  );
};
