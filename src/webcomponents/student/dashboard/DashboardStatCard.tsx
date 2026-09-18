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
    <Card className="relative overflow-hidden rounded-[20px] border border-slate-100/90 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2.5">
        <span className="text-2xl font-bold tracking-tight text-slate-800">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100/80"
                : "bg-rose-50 text-rose-600 border border-rose-100/80"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="mt-1 text-xs font-medium text-slate-400">
        vs. last period
      </p>
    </Card>
  );
};

// Simple inline wrapper so Card doesn't need external import
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
