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
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <Card className="rounded-[20px] border border-slate-100/90 bg-white shadow-xs transition-all duration-200 hover:shadow-sm">
      <CardContent className="flex flex-col gap-2 p-5">
        {/* Header: Title + Icon */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50/70 text-[#3454FB]">
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* Value & Trend */}
        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-2xl font-bold tracking-tight text-slate-800">{value}</span>
          {trend !== undefined && (
            <span
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
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
          <p className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
