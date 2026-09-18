"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Star, Shield, ArrowRight, Loader2 } from "lucide-react";
import { useGetSubscriptionPlans, useCreateCheckoutSessionMutation } from "@/api/payment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  currentPlanType?: "FREE" | "BASIC" | "PRO" | string;
}

type BillingCycle = "MONTHLY" | "ANNUAL";

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

export const UpgradeModal = ({
  open,
  onOpenChange,
  title = "Upgrade Your Classroom",
  description = "Create more classes, enroll more students, and unlock all premium activities.",
  currentPlanType = "FREE",
}: UpgradeModalProps) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const { data: plans = [], isLoading } = useGetSubscriptionPlans();
  const { mutate: createCheckout, isPending } = useCreateCheckoutSessionMutation();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
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

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // Sort plans cleanly by monthly price: FREE -> BASIC -> PRO
  const sortedPlans = [...plans].sort(
    (a: any, b: any) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0)
  );

  // Dynamic annual discount calculation
  const proPlan =
    sortedPlans.find((p: any) => p.type === "PRO") ||
    sortedPlans.find((p: any) => p.annualPrice > 0);
  const discountPercent =
    proPlan && proPlan.monthlyPrice > 0 && proPlan.annualPrice > 0
      ? Math.round(
          ((proPlan.monthlyPrice * 12 - proPlan.annualPrice) /
            (proPlan.monthlyPrice * 12)) *
            100
        )
      : 17;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px] w-full p-6 sm:p-7 rounded-[22px] border border-slate-200/80 bg-white shadow-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-center items-center pb-2">
          <div className="w-10 h-10 rounded-xl bg-[#007EEF]/10 border border-[#007EEF]/20 flex items-center justify-center text-[#007EEF] mb-1">
            <Sparkles className="w-5 h-5 text-[#007EEF]" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 max-w-md mx-auto">
            {description}
          </DialogDescription>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 mt-3">
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                billingCycle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                billingCycle === "ANNUAL"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Annual Billing
              {discountPercent > 0 && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                  Save {discountPercent}%
                </span>
              )}
            </button>
          </div>
        </DialogHeader>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {isLoading ? (
            <div className="col-span-3 py-12 text-center text-xs text-slate-400">
              Loading plans...
            </div>
          ) : (
            sortedPlans.map((p: any) => {
              const isCurrent = p.type === currentPlanType;
              const isPro = p.type === "PRO";
              const style = PLAN_STYLES[p.type] ?? PLAN_STYLES.BASIC;
              const Icon = style.icon;
              const priceCents = billingCycle === "ANNUAL" ? p.annualPrice : p.monthlyPrice;
              const periodLabel = billingCycle === "ANNUAL" ? "/yr" : "/mo";

              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex flex-col justify-between p-5 rounded-xl border transition-all relative group",
                    isPro
                      ? "border-2 border-[#007EEF] bg-[#007EEF]/[0.02]"
                      : "border-slate-200/70 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                            style.iconBg
                          )}
                        >
                          <Icon className={cn("h-4 w-4", style.iconColor)} />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 capitalize">
                            {p.type.toLowerCase()} plan
                          </p>
                        </div>
                      </div>

                      {/* Header Badges */}
                      {isPro ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#007EEF]/10 text-[#007EEF] border border-[#007EEF]/20 shrink-0">
                          Popular
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                          Current
                        </span>
                      ) : null}
                    </div>

                    {/* Price matching PackageCard */}
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                          {p.type === "FREE" ? "$0" : formatPrice(priceCents)}
                        </span>
                        <span className="text-xs text-slate-500 font-normal ml-0.5">
                          {p.type === "FREE" ? "forever" : periodLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                        {p.type === "FREE"
                          ? "Always free for teachers"
                          : billingCycle === "ANNUAL"
                          ? `$${(priceCents / 1200).toFixed(2)}/mo billed annually`
                          : `· $${formatPrice(p.annualPrice)}/yr billed annually`}
                      </p>
                    </div>

                    {/* Feature List matching PackageCard */}
                    <ul className="space-y-2 pt-3 border-t border-slate-100">
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>
                          Up to <strong className="font-medium text-slate-800">{p.maxClasses}</strong> classes
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>
                          <strong className="font-medium text-slate-800">{p.maxStudentsPerClass}</strong> students per class
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>
                          <strong className="font-medium text-slate-800">{p.maxScheduledTasksInClass}</strong> assigned activities
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>
                          {p.type === "PRO"
                            ? "All premium interactive activities"
                            : p.type === "BASIC"
                            ? "Standard premium access"
                            : "Free activities library"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA Buttons - Unified brand blue #007EEF */}
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    {isCurrent ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full h-9 text-xs font-medium rounded-lg border-slate-200/80 bg-slate-50 text-slate-400 shadow-none cursor-default"
                      >
                        Current Plan
                      </Button>
                    ) : p.type === "FREE" ? (
                      <Button
                        disabled
                        variant="outline"
                        className="w-full h-9 text-xs font-medium rounded-lg border-slate-200/80 bg-slate-50 text-slate-400 shadow-none cursor-default"
                      >
                        Free Tier
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleUpgrade(p.id)}
                        disabled={isPending}
                        className="w-full h-9 text-xs font-medium rounded-lg bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        style={{ boxShadow: "none" }}
                      >
                        {isPending && checkoutPlanId === p.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Upgrade to {p.name}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
