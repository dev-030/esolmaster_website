"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Download,
  Shield,
  Star,
  Zap,
  Calendar,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateCheckoutSessionMutation,
  useGetBillingInfoQuery,
  useGetMySubscription,
  useGetSubscriptionPlans,
  useCreateBillingPortalSessionMutation,
  useConfirmCheckoutSessionMutation,
} from "@/api/payment";
import { useTeacherSubscription } from "@/provider/SubscriptionProvider";
import { formatDate } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type PlanStatus = "Active" | "Cancelling" | "Cancelled" | "Past Due" | "Payment action needed" | "Trialing";

const statusBadge: Record<PlanStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Cancelling: "bg-amber-50 text-amber-700 border-amber-200/60",
  Cancelled: "bg-red-50 text-red-700 border-red-200/60",
  "Past Due": "bg-amber-50 text-amber-700 border-amber-200/60",
  "Payment action needed": "bg-red-50 text-red-700 border-red-200/60",
  Trialing: "bg-primary/10 text-primary border-primary/20",
};

type BillingCycle = "MONTHLY" | "ANNUAL";

type SubscriptionPlan = {
  id: string;
  name: string;
  type: "FREE" | "BASIC" | "PRO";
  monthlyPrice: number;
  annualPrice: number;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxScheduledTasksInClass: number;
};

type MySubscription = {
  billingStatus: "ACTIVE" | "PAST_DUE" | "TRIALING" | "CANCELED" | "CANCELING" | "PAYMENT_ACTION_REQUIRED";
  billingCycle: BillingCycle | null;
  boughtPrice: number;
  discountAmount: number;
  finalPrice: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
};

interface BillingRecord {
  id: string;
  date: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl: string;
  invoicePdf: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatPrice = (amount?: number | null) =>
  `$${((amount ?? 0) / 100).toFixed(2)}`;

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toLowerCase(),
  }).format(amount / 100);

const getStatusLabel = (status?: MySubscription["billingStatus"]): PlanStatus => {
  if (status === "CANCELING") return "Cancelling";
  if (status === "PAST_DUE") return "Past Due";
  if (status === "PAYMENT_ACTION_REQUIRED") return "Payment action needed";
  if (status === "TRIALING") return "Trialing";
  if (status === "CANCELED") return "Cancelled";
  return "Active";
};

const PLAN_STYLES: Record<
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
    iconBg: "bg-[#007EEF]/10 border-[#007EEF]/20",
    iconColor: "text-[#007EEF]",
  },
};

// ── Card: Subscription ────────────────────────────────────────────────────────

const SubscriptionCard = ({
  onManageBilling,
  isManagingBilling,
}: {
  onManageBilling: () => void;
  isManagingBilling: boolean;
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const { openUpgradeModal } = useTeacherSubscription();

  const { data: subscription, isLoading: isSubscriptionLoading } = useGetMySubscription();
  const { data: plans, isLoading: isPlansLoading } = useGetSubscriptionPlans();
  const { mutate: createCheckout, isPending } = useCreateCheckoutSessionMutation();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  if (isSubscriptionLoading || isPlansLoading) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-6 space-y-4 w-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-32 rounded" />
        <div className="border-t border-slate-100" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  const currentSubscription = subscription as MySubscription;
  const subscriptionPlans = (plans ?? []) as SubscriptionPlan[];
  const currentPlan = currentSubscription?.plan;
  const statusLabel = getStatusLabel(currentSubscription?.billingStatus);

  const planType = currentPlan?.type ?? "FREE";
  const planStyle = PLAN_STYLES[planType] ?? PLAN_STYLES.FREE;
  const Icon = planStyle.icon;

  const displayPrice =
    currentSubscription?.billingCycle === "ANNUAL"
      ? currentPlan?.annualPrice
      : currentPlan?.monthlyPrice;

  const isFree = planType === "FREE";

  const handleCheckout = (planId: string) => {
    setCheckoutPlanId(planId);
    createCheckout(
      { planId, billingCycle },
      {
        onSuccess: (data: any) => {
          if (data?.url) {
            window.location.href = data.url;
          } else {
            toast.error("Unable to start checkout session.");
          }
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || "Failed to initialize checkout.";
          toast.error(msg);
          setCheckoutPlanId(null);
        },
      }
    );
  };

  const paidPlans = [...subscriptionPlans]
    .filter((plan) => plan.type !== "FREE")
    .sort((a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0));

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-6 space-y-5 w-full">
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                planStyle.iconBg
              )}
            >
              <Icon className={cn("h-4 w-4", planStyle.iconColor)} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                {currentPlan?.name ?? "Free"} Plan
              </h3>
              <p className="text-xs text-slate-500 capitalize">
                {isFree ? "Free baseline tier" : `${planType.toLowerCase()} subscription`}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-[11px] font-medium px-2.5 py-0.5 rounded-md border",
              statusBadge[statusLabel]
            )}
          >
            {statusLabel}
          </span>
        </div>

        {/* Price Display */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-slate-900 tracking-tight">
              {isFree ? "$0" : formatPrice(displayPrice)}
            </span>
            <span className="text-xs text-slate-500 font-normal ml-0.5">
              {isFree
                ? "forever"
                : currentSubscription?.billingCycle === "ANNUAL"
                ? "/yr"
                : "/mo"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isFree
              ? "Free baseline tier for all teachers"
              : currentSubscription?.billingCycle === "ANNUAL"
              ? "Billed annually"
              : "Billed monthly"}
          </p>
        </div>

        <div className="border-t border-slate-100" />

        {/* Feature Limits */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>
              Up to <strong className="font-medium text-slate-800">{currentPlan?.maxClasses ?? 2}</strong> classes
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>
              <strong className="font-medium text-slate-800">{currentPlan?.maxStudentsPerClass ?? 20}</strong> students per class
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>
              <strong className="font-medium text-slate-800">{currentPlan?.maxScheduledTasksInClass ?? 5}</strong> assigned activities per class
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>
              {currentPlan?.type === "PRO"
                ? "All premium interactive activities included"
                : currentPlan?.type === "BASIC"
                ? "Standard premium activities included"
                : "Free activities library"}
            </span>
          </li>
        </ul>

        {/* Billing Cycle Selector is only relevant before the first purchase. */}
        {isFree && <div className="pt-2">
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                billingCycle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                billingCycle === "ANNUAL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Annual
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-1 py-0.2 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>}

        {/* Checkout creates a subscription only for free users. Paid users manage
            their existing Stripe subscription, preventing duplicate charges. */}
        {isFree ? <div className="grid grid-cols-1 sm:grid-cols-2 max-w-md gap-2 pt-1">
          {paidPlans.map((plan) => {
            const isCurrentPlan =
              currentPlan?.id === plan.id &&
              currentSubscription?.billingCycle === billingCycle;
            const price = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;

            if (isCurrentPlan) {
              return (
                <Button
                  key={plan.id}
                  disabled
                  variant="outline"
                  className="w-full h-9 text-xs font-medium rounded-lg border-slate-200/80 bg-slate-50 text-slate-400 shadow-none cursor-default"
                >
                  Current Plan
                </Button>
              );
            }

            return (
              <Button
                key={plan.id}
                disabled={isPending}
                onClick={() => handleCheckout(plan.id)}
                className="w-full h-9 text-xs font-medium rounded-lg bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ boxShadow: "none" }}
              >
                {isPending && checkoutPlanId === plan.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Upgrade to {plan.name}
                    <span className="text-[11px] opacity-90">({formatPrice(price)})</span>
                  </>
                )}
              </Button>
            );
          })}
        </div> : (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-xs text-slate-600">
            <p className="font-medium text-slate-800">Manage your existing subscription securely in Stripe.</p>
            <p className="mt-1">Change plan, update payment details, cancel, or reactivate before your renewal date.</p>
            <Button
              onClick={onManageBilling}
              disabled={isManagingBilling}
              variant="outline"
              className="mt-3 h-8 px-3 text-xs font-medium"
            >
              {isManagingBilling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Manage subscription"}
            </Button>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {isFree
              ? "No renewal charges"
              : currentSubscription?.cancelAtPeriodEnd && currentSubscription?.currentPeriodEnd
              ? `Access ends ${formatDate(new Date(currentSubscription.currentPeriodEnd), "MMM d, yyyy")}`
              : currentSubscription?.currentPeriodEnd
              ? `Renews ${formatDate(new Date(currentSubscription.currentPeriodEnd), "MMM d, yyyy")}`
              : "Active subscription"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFree ? (
            <button
              type="button"
              onClick={() => openUpgradeModal()}
              className="text-xs font-medium text-[#007EEF] hover:underline cursor-pointer"
            >
              Compare plans
            </button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onManageBilling}
              disabled={isManagingBilling}
              className="h-7 px-2 text-xs font-medium text-[#007EEF] hover:text-[#0066cc] hover:bg-[#007EEF]/10 rounded-md"
            >
              Manage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Card: Billing History ─────────────────────────────────────────────────────

const BillingHistoryCard = ({ billingHistory }: { billingHistory: BillingRecord[] }) => {
  const handleDownload = (invoicePdf: string, id: string) => {
    window.open(invoicePdf, "_blank");
    console.log("Downloading invoice:", id);
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none overflow-hidden w-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-slate-200/60 bg-slate-100 flex items-center justify-center shrink-0">
            <Receipt className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Billing History</h3>
            <p className="text-xs text-slate-500">View and download past invoices</p>
          </div>
        </div>
        {billingHistory && billingHistory.length > 0 && (
          <span className="text-xs text-slate-400 font-medium">
            {billingHistory.length} invoice{billingHistory.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {!billingHistory || billingHistory.length === 0 ? (
        <div className="py-12 px-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400 mb-1">
            <Receipt className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No billing history yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Invoices and payment receipts will appear here once you subscribe to a paid plan.
          </p>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70 border-b border-slate-200/70">
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 pl-5">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3">
                  Plan
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3">
                  Amount
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 pr-5">
                  Invoice
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((record) => (
                <TableRow
                  key={record.id}
                  className="hover:bg-slate-50/60 border-b border-slate-100 last:border-0"
                >
                  <TableCell className="pl-5 text-xs text-slate-600 py-3">
                    {formatDate(new Date(record.date), "PPP")}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700 py-3">
                    {record.plan}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3">
                    {formatAmount(record.amount, record.currency)}
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border",
                        record.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                          : record.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200/60"
                          : "bg-red-50 text-red-700 border-red-200/60"
                      )}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleDownload(record.invoicePdf, record.id)}
                      className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {billingHistory.length > 5 && (
            <div className="px-5 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Showing {billingHistory.length} records
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Root ──────────────────────────────────────────────────────────────────────

export const BillingInfo = () => {
  const { data: billingInfo, refetch: refetchBillingInfo } = useGetBillingInfoQuery();
  const { mutate: createBillingPortal, isPending: isManagingBilling } =
    useCreateBillingPortalSessionMutation();
  const { mutate: confirmSession } = useConfirmCheckoutSessionMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const cancelled = params.get("cancelled");

    if (sessionId) {
      toast.loading("Activating your subscription...", { id: "checkout-confirm" });
      confirmSession(sessionId, {
        onSuccess: () => {
          toast.success("Subscription upgraded successfully!", { id: "checkout-confirm" });
          refetchBillingInfo();
        },
        onError: () => {
          toast.success("Welcome! Subscription status refreshed.", { id: "checkout-confirm" });
          refetchBillingInfo();
        },
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (cancelled === "true") {
      toast.info("Checkout was cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [confirmSession, refetchBillingInfo]);

  const handleManageBilling = () => {
    createBillingPortal(undefined, {
      onSuccess: (data) => {
        if (data?.url) window.location.assign(data.url);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Unable to open Stripe billing portal");
      },
    });
  };

  return (
    <div className="w-full space-y-6">
      <SubscriptionCard
        onManageBilling={handleManageBilling}
        isManagingBilling={isManagingBilling}
      />
      <BillingHistoryCard billingHistory={billingInfo?.billingHistory || []} />
    </div>
  );
};
