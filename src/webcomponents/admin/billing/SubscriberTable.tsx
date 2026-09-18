/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/webcomponents/reusable";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Search,
  XCircle,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCancelSubscriptionMutation,
  useChangeUserPlanMutation,
  useGetAdminSubscriptions,
} from "@/api/payment";
import { BillingPackage } from "./PackageCard";
import { AdminSubscription, SubscriptionParams } from "@/types/payment";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<
  string,
  {
    className: string;
    label: string;
    icon: React.ElementType;
  }
> = {
  ACTIVE: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    label: "Active",
    icon: CheckCircle2,
  },
  CANCELLED: {
    className: "bg-rose-50 text-rose-700 border-rose-200/60",
    label: "Cancelled",
    icon: XCircle,
  },
  PAST_DUE: {
    className: "bg-amber-50 text-amber-700 border-amber-200/60",
    label: "Past Due",
    icon: AlertCircle,
  },
  TRIALING: {
    className: "bg-blue-50 text-blue-700 border-blue-200/60",
    label: "Trialing",
    icon: Zap,
  },
};

const formatMoney = (value: number) =>
  (value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getStatusKey = (status: string) => status.replace(/\s+/g, "_").toUpperCase();

export const SubscribersTable = ({ packages }: { packages: BillingPackage[] }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterBillingCycle, setFilterBillingCycle] = useState("all");
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] = useState<AdminSubscription | null>(null);
  const [nextPlanType, setNextPlanType] = useState<SubscriptionParams["planType"]>("BASIC");
  const [nextBillingCycle, setNextBillingCycle] = useState<SubscriptionParams["billingCycle"]>("MONTHLY");
  const debouncedSearch = useDebounce(search, 350);

  const params = useMemo<SubscriptionParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      planType: filterPlan === "all" ? undefined : (filterPlan as SubscriptionParams["planType"]),
      billingCycle:
        filterBillingCycle === "all"
          ? undefined
          : (filterBillingCycle as SubscriptionParams["billingCycle"]),
    }),
    [debouncedSearch, filterBillingCycle, filterPlan, page],
  );

  const { data, isLoading, isError, error, isFetching } = useGetAdminSubscriptions(params);
  const changePlanMutation = useChangeUserPlanMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();

  const subscriptions = data?.data ?? [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? 0;

  const activePlanOptions = packages.filter((pkg) => pkg.isActive && pkg.type !== "FREE");

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterPlan, filterBillingCycle]);

  const handleFilter = (setter: (value: string) => void) => (value: string | null) => {
    if (!value) return;
    setter(value);
  };

  const openChangePlan = (subscription: AdminSubscription) => {
    setSelectedSubscription(subscription);
    setNextPlanType(subscription.plan.type as SubscriptionParams["planType"]);
    setNextBillingCycle((subscription.billingCycle ?? "MONTHLY") as SubscriptionParams["billingCycle"]);
    setChangeDialogOpen(true);
  };

  const closeChangePlan = () => {
    setChangeDialogOpen(false);
    setSelectedSubscription(null);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setSubscriptionToCancel(null);
  };

  const submitChangePlan = async () => {
    if (!selectedSubscription || !nextPlanType || !nextBillingCycle) return;

    try {
      await changePlanMutation.mutateAsync({
        userId: selectedSubscription.userId,
        changePlanBody: {
          planType: nextPlanType,
          billingCycle: nextBillingCycle,
        },
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["adminBillingOverview"] }),
        queryClient.invalidateQueries({ queryKey: ["mySubscription"] }),
      ]);

      toast.success("Subscription plan updated successfully.");
      closeChangePlan();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to update subscription plan.");
    }
  };

  const handleCancelSubscription = (subscription: AdminSubscription) => {
    setSubscriptionToCancel(subscription);
    setCancelDialogOpen(true);
  };

  const confirmCancelSubscription = async () => {
    if (!subscriptionToCancel) return;

    try {
      await cancelSubscriptionMutation.mutateAsync(subscriptionToCancel.userId);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] }),
        queryClient.invalidateQueries({ queryKey: ["adminBillingOverview"] }),
      ]);

      toast.success("Subscription canceled successfully.");
      closeCancelDialog();
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "Failed to cancel subscription.");
    }
  };

  const actionBusy = changePlanMutation.isPending || cancelSubscriptionMutation.isPending;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none overflow-hidden">
      {/* Table Toolbar */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Subscribers</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200/60">
            {totalItems}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="pl-8 w-full sm:w-48 h-8.5 text-xs rounded-lg border-slate-200/80 bg-slate-50/50 focus:bg-white focus:border-slate-300 shadow-none"
            />
          </div>

          <Select value={filterPlan} onValueChange={handleFilter(setFilterPlan)}>
            <SelectTrigger className="w-32 h-8.5 text-xs rounded-lg border-slate-200/80 bg-white shadow-none">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {activePlanOptions.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.type}>
                  {pkg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterBillingCycle}
            onValueChange={handleFilter(setFilterBillingCycle)}
          >
            <SelectTrigger className="w-32 h-8.5 text-xs rounded-lg border-slate-200/80 bg-white shadow-none">
              <SelectValue placeholder="Billing Cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="ANNUAL">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        {isError ? (
          <div className="px-6 py-10 text-center text-sm text-rose-600">
            {error instanceof Error ? error.message : "Failed to load subscribers."}
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60 border-b border-slate-100 hover:bg-slate-50/60">
                  <TableHead className="pl-6 text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Teacher</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Plan</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Billing</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Start Date</TableHead>
                  <TableHead className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-2.5">Price</TableHead>
                  <TableHead className="pr-6 w-10 py-2.5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-slate-100">
                      <TableCell className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-slate-100 rounded animate-pulse" />
                            <div className="h-2.5 w-36 bg-slate-100 rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><div className="h-5 w-16 bg-slate-100 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-3.5 w-14 bg-slate-100 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-slate-100 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-3.5 w-12 bg-slate-100 rounded animate-pulse" /></TableCell>
                      <TableCell className="pr-6"><div className="h-6 w-6 bg-slate-100 rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-slate-500">
                      No paid subscribers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => {
                    const statusKey = getStatusKey(subscription.billingStatus);
                    const status = STATUS_BADGE[statusKey] ?? STATUS_BADGE.ACTIVE;
                    const StatusIcon = status.icon;
                    const initials = `${subscription.user.firstName?.[0] ?? ""}${subscription.user.lastName?.[0] ?? ""}`.trim();

                    return (
                      <TableRow key={subscription.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 text-xs font-semibold shrink-0">
                              {initials || "U"}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {subscription.user.firstName} {subscription.user.lastName}
                              </p>
                              <p className="text-[11px] text-slate-500">{subscription.user.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                            {subscription.plan.name}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className="text-xs text-slate-600 capitalize">
                            {subscription.billingCycle ? subscription.billingCycle.toLowerCase() : "—"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${status.className}`}>
                            <StatusIcon className="h-3 w-3 shrink-0" />
                            {status.label}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className="text-xs text-slate-500">
                            {formatDate(subscription.currentPeriodStart ?? subscription.createdAt)}
                          </span>
                        </TableCell>

                        <TableCell className="py-3">
                          <span className={`text-xs font-semibold ${subscription.finalPrice > 0 ? "text-slate-900" : "text-slate-400"}`}>
                            {subscription.finalPrice > 0 ? `$${formatMoney(subscription.finalPrice)}` : "—"}
                          </span>
                        </TableCell>

                        <TableCell className="pr-6 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-7 w-7 transition-colors outline-none"
                              disabled={actionBusy}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => openChangePlan(subscription)}>
                                Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600"
                                onClick={() => handleCancelSubscription(subscription)}
                              >
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
              <Pagination
                page={meta?.page ?? page}
                totalItems={totalItems}
                pageSize={meta?.limit ?? PAGE_SIZE}
                onPageChange={setPage}
              />
              {isFetching && !isLoading ? (
                <div className="text-xs text-slate-400">Updating...</div>
              ) : null}
            </div>
          </>
        )}
      </div>

      <Dialog open={changeDialogOpen} onOpenChange={(open) => !open && closeChangePlan()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Change Subscription Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Plan</Label>
              <Select
                value={nextPlanType ?? undefined}
                onValueChange={(value) => setNextPlanType(value as SubscriptionParams["planType"])}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg border-slate-200/80">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {activePlanOptions.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.type}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Billing Cycle</Label>
              <Select
                value={nextBillingCycle ?? undefined}
                onValueChange={(value) => setNextBillingCycle(value as SubscriptionParams["billingCycle"])}
              >
                <SelectTrigger className="h-9 text-xs rounded-lg border-slate-200/80">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={closeChangePlan} className="h-8.5 rounded-lg border-slate-200/80 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={submitChangePlan}
              disabled={changePlanMutation.isPending}
              className="h-8.5 rounded-lg text-xs gap-1.5"
            >
              {changePlanMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => !open && closeCancelDialog()}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-slate-900">Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              {subscriptionToCancel
                ? `Are you sure you want to cancel the subscription for ${subscriptionToCancel.user.firstName} ${subscriptionToCancel.user.lastName}?`
                : "Are you sure you want to cancel this subscription?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-8.5 rounded-lg border-slate-200/80 text-xs">Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="h-8.5 rounded-lg text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {cancelSubscriptionMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Confirm Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
