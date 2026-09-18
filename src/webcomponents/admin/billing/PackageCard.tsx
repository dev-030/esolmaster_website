import { Shield, Star, Zap, Pencil, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPlan } from "@/types/payment";

export type BillingPackage = AdminPlan;

const PLAN_CONFIG: Record<
  string,
  {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
  }
> = {
  FREE: {
    icon: Shield,
    iconBg: "bg-slate-100 border-slate-200/60",
    iconColor: "text-slate-600",
  },
  BASIC: {
    icon: Star,
    iconBg: "bg-blue-50 border-blue-200/60",
    iconColor: "text-blue-600",
  },
  PRO: {
    icon: Zap,
    iconBg: "bg-indigo-50 border-indigo-200/60",
    iconColor: "text-indigo-600",
  },
};

const formatPrice = (value: number) =>
  (value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const PackageCard = ({
  pkg,
  onEdit,
  onManagePremiumTasks,
}: {
  pkg: BillingPackage;
  onEdit?: () => void;
  onManagePremiumTasks?: () => void;
}) => {
  const planStyle = PLAN_CONFIG[pkg.type] ?? PLAN_CONFIG.BASIC;
  const Icon = planStyle.icon;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-none hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${planStyle.iconBg}`}>
              <Icon className={`h-4 w-4 ${planStyle.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 tracking-tight">{pkg.name}</h3>
              <p className="text-xs text-slate-500 capitalize">{pkg.type.toLowerCase()} plan</p>
            </div>
          </div>
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div>
          <span className="text-2xl font-semibold text-slate-900 tracking-tight">${formatPrice(pkg.monthlyPrice)}</span>
          <span className="text-xs text-slate-500 ml-1">/mo</span>
          <span className="text-xs text-slate-400 ml-2">· ${formatPrice(pkg.annualPrice)}/yr</span>
        </div>

        <div className="border-t border-slate-100" />

        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Up to <strong className="font-medium text-slate-800">{pkg.maxClasses}</strong> classes</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span><strong className="font-medium text-slate-800">{pkg.maxStudentsPerClass}</strong> students per class</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span><strong className="font-medium text-slate-800">{pkg.maxScheduledTasksInClass}</strong> assigned activities per class</span>
          </li>
        </ul>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              pkg.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                : "bg-slate-100 text-slate-600 border-slate-200/60"
            }`}
          >
            {pkg.isActive ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {pkg._count?.subscriptions ?? 0} subscriber
            {pkg._count?.subscriptions === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PackageCardSkeleton = () => (
  <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-none space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
    <div className="h-7 w-32 bg-slate-100 rounded animate-pulse" />
    <div className="border-t border-slate-100 pt-3 space-y-2.5">
      <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
      <div className="h-5 w-14 bg-slate-100 rounded animate-pulse" />
      <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
    </div>
  </div>
);
