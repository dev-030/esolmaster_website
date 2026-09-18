'use client';

import { useState } from "react";
import {
  Package as PackageIcon,
  Plus,
  DollarSign,
  Users,
  Star,
  Zap,
} from "lucide-react";
import { SubscribersTable } from "./SubscriberTable";
import { PackageCard, PackageCardSkeleton, type BillingPackage } from "./PackageCard";
import { PackageDialog } from "./PackageForm";
import { PremiumTasksDialog } from "./PremiumTasksDialog";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { useGetAdminBillingOverview, useGetAdminPlans } from "@/api/payment";

export const AdminBillingManager = () => {
  const { data: adminBillingOverview, isLoading: isLoadingOverview } = useGetAdminBillingOverview();
  const { data: adminPlans, isLoading: isLoadingPlans } = useGetAdminPlans();

  const [editingPkg, setEditingPkg] = useState<BillingPackage | null>(null);
  const [creatingPkg, setCreatingPkg] = useState(false);
  const [managingPkg, setManagingPkg] = useState<BillingPackage | null>(null);

  // Stats
  const revenue = adminBillingOverview?.revenue;
  const paidSubscribers = adminBillingOverview?.paidSubscribers;
  const basicPlanSubscribers = adminBillingOverview?.planSubscribers?.basic;
  const proPlanSubscribers = adminBillingOverview?.planSubscribers?.pro;
  const packages: BillingPackage[] = adminPlans ?? [];

  const formattedRevenue = `$${((revenue?.currentMonth || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Package Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subscription packages, pricing plans &amp; subscribers
          </p>
        </div>
        <Button
          className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium px-4 shadow-none gap-1.5 self-start sm:self-auto"
          onClick={() => setCreatingPkg(true)}
        >
          <Plus className="h-4 w-4" />
          New Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Revenue"
          value={formattedRevenue}
          sub="vs last month"
          trend={
            revenue?.percentageChange !== undefined
              ? `${revenue.percentageChange >= 0 ? "+" : ""}${revenue.percentageChange}%`
              : undefined
          }
          trendUp={(revenue?.percentageChange ?? 0) >= 0}
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600 border border-emerald-200/60"
          iconColor="text-emerald-600"
          isLoading={isLoadingOverview}
        />
        <StatCard
          label="Paid Subscribers"
          value={paidSubscribers?.currentMonth || 0}
          sub="vs last month"
          trend={
            paidSubscribers?.percentageChange !== undefined
              ? `${paidSubscribers.percentageChange >= 0 ? "+" : ""}${paidSubscribers.percentageChange}%`
              : undefined
          }
          trendUp={(paidSubscribers?.percentageChange ?? 0) >= 0}
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 border border-blue-200/60"
          iconColor="text-blue-600"
          isLoading={isLoadingOverview}
        />
        <StatCard
          label="Basic Subscribers"
          value={basicPlanSubscribers?.currentMonth || 0}
          sub="basic tier"
          trend={
            basicPlanSubscribers?.percentageChange !== undefined
              ? `${basicPlanSubscribers.percentageChange >= 0 ? "+" : ""}${basicPlanSubscribers.percentageChange}%`
              : undefined
          }
          trendUp={(basicPlanSubscribers?.percentageChange ?? 0) >= 0}
          icon={Star}
          iconBg="bg-violet-50 text-violet-600 border border-violet-200/60"
          iconColor="text-violet-600"
          isLoading={isLoadingOverview}
        />
        <StatCard
          label="Pro Subscribers"
          value={proPlanSubscribers?.currentMonth || 0}
          sub="pro tier"
          trend={
            proPlanSubscribers?.percentageChange !== undefined
              ? `${proPlanSubscribers.percentageChange >= 0 ? "+" : ""}${proPlanSubscribers.percentageChange}%`
              : undefined
          }
          trendUp={(proPlanSubscribers?.percentageChange ?? 0) >= 0}
          icon={Zap}
          iconBg="bg-indigo-50 text-indigo-600 border border-indigo-200/60"
          iconColor="text-indigo-600"
          isLoading={isLoadingOverview}
        />
      </div>

      {/* Packages Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">Packages</h2>
          {!isLoadingPlans && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200/60">
              {packages.length}
            </span>
          )}
        </div>

        {isLoadingPlans ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PackageCardSkeleton />
            <PackageCardSkeleton />
            <PackageCardSkeleton />
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-xl border border-slate-200/70 bg-white p-8 text-center shadow-none">
            <p className="text-sm text-slate-500">No packages created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={() => setEditingPkg(pkg)}
                onManagePremiumTasks={() => setManagingPkg(pkg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subscribers Section */}
      <div className="space-y-3">
        <SubscribersTable packages={packages} />
      </div>

      {/* Dialogs */}
      <PackageDialog
        pkg={null}
        open={creatingPkg}
        onClose={() => setCreatingPkg(false)}
      />
      <PackageDialog
        pkg={editingPkg}
        open={!!editingPkg}
        onClose={() => setEditingPkg(null)}
      />
      <PremiumTasksDialog
        pkg={managingPkg}
        open={!!managingPkg}
        onClose={() => setManagingPkg(null)}
      />
    </div>
  );
};
