import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconContainerClass?: string;
  change: number;
  direction: "increase" | "decrease" | "neutral";
}

export const StatCardItem = ({ card }: { card: StatCard }) => {
  const isPositive = card.direction === "increase";
  const isNegative = card.direction === "decrease";

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none transition-colors hover:border-slate-300">
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 truncate">{card.title}</span>
        <div className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${card.iconContainerClass || "bg-slate-100/80 border-slate-200/60 text-slate-600"}`}>
          {card.icon}
        </div>
      </div>

      {/* Value */}
      <div className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
        {card.value}
      </div>

      {/* Change from last month */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium">
        {isPositive && <TrendingUp size={13} className="text-emerald-600" />}
        {isNegative && <TrendingDown size={13} className="text-rose-600" />}
        <span className={isPositive ? "text-emerald-600 font-semibold" : isNegative ? "text-rose-600 font-semibold" : "text-slate-500"}>
          {isPositive ? "+" : ""}{card.change}%
        </span>
        <span className="font-normal text-slate-400">from last month</span>
      </div>
    </div>
  );
};
