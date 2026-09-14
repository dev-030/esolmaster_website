export const InfoRow = ({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
}) => {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p
        className={
          mono
            ? "font-mono text-xs text-slate-600 font-medium"
            : "text-sm text-slate-700 font-medium leading-relaxed"
        }
      >
        {value}
      </p>
    </div>
  );
};