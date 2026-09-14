import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  change?: number;
  trend?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  gradient?: string;
  strokeColor?: string;
  iconBg?: string;
};

export const DashboardStatCard = ({
  title,
  value,
  change,
  icon: Icon,
}: Props) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-slate-100/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50/80 text-[#3454FB]">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-3xl font-black tracking-tight text-slate-900">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-slate-400">
        vs. last period
      </p>
    </div>
  );
};
