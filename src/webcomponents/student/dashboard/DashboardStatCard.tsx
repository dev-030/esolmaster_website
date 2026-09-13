import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  change?: number;
  trend?: "increase" | "decrease" | "neutral";
  icon: LucideIcon;
  gradient: string;
  strokeColor: string;
  iconBg: string;
};

export const DashboardStatCard = ({
  title,
  value,
  change,
  icon: Icon,
  gradient,
  strokeColor,
  iconBg,
}: Props) => {
  const isPositive = change !== undefined && change > 0;

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#3454FB]/5"
      />

      <div className="flex items-start justify-between relative z-10 mb-2">
        <div>
          <p className="text-[15px] font-semibold text-slate-900">
            {title}
          </p>
          <p className="mt-1 text-[32px] font-bold tracking-tight text-slate-900">{value}</p>
        </div>

        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
        >
          <Icon className="h-6 w-6 text-[#3454FB]" />
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        {change !== undefined && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {isPositive ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}

        <span className="text-[13px] font-medium text-slate-400">vs last month</span>
      </div>
    </div>
  );
};
