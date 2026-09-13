import { TrendingDown, TrendingUp } from "lucide-react";
export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
  iconColor: string;
  change: number; // positive = increase, negative = decrease
  direction: "increase" | "decrease" | "neutral";
}
export const StatCardItem = ({ card }: { card: StatCard }) => {
  const isPositive = card.direction === "increase";

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</span>
        <div
          className="rounded-xl border border-blue-100 bg-blue-50 p-2"
        >
          <span className="text-[#2F7EDA]">{card.icon}</span>
        </div>
      </div>

      {/* Value */}
      <div className="text-3xl font-bold tracking-tight text-slate-900">
        {card.value}
      </div>

      {/* Change from last month */}
      <div className="flex items-center gap-1 text-xs font-medium">
        {isPositive ? (
          <TrendingUp size={14} className="text-emerald-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span className={isPositive ? "text-emerald-600" : "text-red-500"}>
          {isPositive ? "+" : ""}
          {card.change}%
        </span>
        <span className="font-normal text-slate-400">from last month</span>
      </div>
    </div>
  );
};
