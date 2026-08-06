'use client';

import { useState } from "react";
import { Package as PackageIcon, Users, Plus } from "lucide-react";
import { SubscribersTable } from "./SubscriberTable";
import { PackageCard, type BillingPackage } from "./PackageCard";
import { PackageDialog } from "./PackageForm";
import { PremiumTasksDialog } from "./PremiumTasksDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import { useGetAdminBillingOverview, useGetAdminPlans } from "@/api/payment";

export const AdminBillingManager = () => {
  const { data: adminBillingOverview } = useGetAdminBillingOverview();
  const { data: adminPlans } = useGetAdminPlans();

  const [editingPkg, setEditingPkg] = useState<BillingPackage | null>(null);
  const [creatingPkg, setCreatingPkg] = useState(false);
  const [managingPkg, setManagingPkg] = useState<BillingPackage | null>(null);

  // Stats
  const revenue = adminBillingOverview?.revenue;
  const paidSubscribers = adminBillingOverview?.paidSubscribers;
  const basicPlanSubscribers = adminBillingOverview?.planSubscribers?.basic;
  const proPlanSubscribers = adminBillingOverview?.planSubscribers?.pro;
  const packages: BillingPackage[] = adminPlans ?? [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage packages, pricing &amp; subscriptions
          </p>
        </div>
        <Button className="gap-1.5" onClick={() => setCreatingPkg(true)}>
          <Plus className="h-4 w-4" />
          New Package
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Revenue"
          value={revenue?.currentMonth || 0}
          sub="vs last month"
          trend={revenue?.percentageChange !== undefined ? `${revenue.percentageChange >= 0 ? "+" : ""}${revenue.percentageChange}%` : undefined}
          trendUp={(revenue?.percentageChange ?? 0) >= 0}
        />
        <StatCard
          label="Paid Subscribers"
          value={paidSubscribers?.currentMonth || 0}
          sub="vs last month"
          trend={paidSubscribers?.percentageChange !== undefined ? `${paidSubscribers.percentageChange >= 0 ? "+" : ""}${paidSubscribers.percentageChange}%` : undefined}
          trendUp={(paidSubscribers?.percentageChange ?? 0) >= 0}
        />
        <StatCard
          label="Basic Subscribers"
          value={basicPlanSubscribers?.currentMonth || 0}
          sub="plan subscribers"
          trend={basicPlanSubscribers?.percentageChange !== undefined ? `${basicPlanSubscribers.percentageChange >= 0 ? "+" : ""}${basicPlanSubscribers.percentageChange}%` : undefined}
          trendUp={(basicPlanSubscribers?.percentageChange ?? 0) >= 0}
        />
        <StatCard
          label="Pro Subscribers"
          value={proPlanSubscribers?.currentMonth || 0}
          sub="plan subscribers"
          trend={proPlanSubscribers?.percentageChange !== undefined ? `${proPlanSubscribers.percentageChange >= 0 ? "+" : ""}${proPlanSubscribers.percentageChange}%` : undefined}
          trendUp={(proPlanSubscribers?.percentageChange ?? 0) >= 0}
        />
      </div>

      {/* Packages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PackageIcon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Packages</h2>
          <Badge variant="secondary" className="text-xs">{packages.length}</Badge>
        </div>

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
      </div>

      {/* Subscribers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">All Subscribers</h2>
        </div>
        <SubscribersTable packages={packages} />
      </div>

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
