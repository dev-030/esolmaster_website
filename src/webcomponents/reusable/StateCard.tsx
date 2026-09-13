import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StateCardProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  trend?: number; // e.g., 15.5 for positive, -10.5 for negative
  subtitle?: string; // e.g., "vs. 14,653 last period"
}

export const StateCard = ({ title, icon: Icon, value, trend, subtitle }: StateCardProps) => {
  const isPositive = trend && trend >= 0;

  return (
    <Card className="rounded-[20px] border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-6">
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold text-slate-900">{title}</span>
          <Icon className="h-5 w-5 text-[#3454FB]" />
        </div>

        {/* Value & Trend */}
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-[32px] font-bold tracking-tight text-slate-900">{value}</span>
          {trend !== undefined && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-[13px] font-medium text-slate-400">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
