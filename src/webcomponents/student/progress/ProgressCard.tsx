export const ProgressCard = ({
  title,
  value,
  label,
  color = "#2563EB",
}: {
  title: string;
  value: number;
  label?: string;
  color?: string;
  gradient?: string;
}) => {
  const safeValue = Math.min(Math.max(value || 0, 0), 100);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-slate-100/90 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-800">
          {safeValue}%
        </span>
        <span className="text-xs font-semibold text-slate-400">
          {label ?? "Proficiency"}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${safeValue}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};
