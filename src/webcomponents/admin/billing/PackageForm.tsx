"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Loader2,
  Save,
  Sparkles,
  Star,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useCreatePlanMutation, useUpdatePlanMutation } from "@/api/payment";
import { AdminPlan } from "@/types/payment";
import { cn } from "@/lib/utils";

type PlanType = "FREE" | "BASIC" | "PRO";

interface FormState {
  name: string;
  type: PlanType;
  description: string;
  monthlyPrice: string; // dollars, as typed
  annualPrice: string; // dollars, as typed
  maxClasses: string;
  maxStudentsPerClass: string;
  maxScheduledTasksInClass: string;
  isActive: boolean;
}

const toFormState = (pkg?: AdminPlan | null): FormState =>
  pkg
    ? {
        name: pkg.name,
        type: pkg.type as PlanType,
        description: "",
        monthlyPrice: (pkg.monthlyPrice / 100).toFixed(2),
        annualPrice: (pkg.annualPrice / 100).toFixed(2),
        maxClasses: String(pkg.maxClasses),
        maxStudentsPerClass: String(pkg.maxStudentsPerClass),
        maxScheduledTasksInClass: String(pkg.maxScheduledTasksInClass),
        isActive: pkg.isActive,
      }
    : {
        name: "",
        type: "BASIC",
        description: "",
        monthlyPrice: "9.99",
        annualPrice: "99.99",
        maxClasses: "5",
        maxStudentsPerClass: "40",
        maxScheduledTasksInClass: "15",
        isActive: true,
      };

export const PackageDialog = ({
  pkg,
  open,
  onClose,
}: {
  pkg: AdminPlan | null;
  open: boolean;
  onClose: () => void;
}) => {
  const isNew = !pkg?.id;
  const [form, setForm] = useState<FormState>(() => toFormState(pkg));

  // Sync state whenever pkg or open changes
  useEffect(() => {
    if (open) {
      setForm(toFormState(pkg));
    }
  }, [pkg, open]);

  const { mutateAsync: createPlan, isPending: creating } = useCreatePlanMutation();
  const { mutateAsync: updatePlan, isPending: updating } = useUpdatePlanMutation();
  const isPending = creating || updating;

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  const handleSave = async () => {
    const toCents = (v: string) => Math.round(parseFloat(v || "0") * 100);

    if (!form.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    try {
      if (isNew) {
        await createPlan({
          name: form.name.trim(),
          type: form.type,
          description: form.description?.trim() || undefined,
          monthlyPrice: form.type === "FREE" ? 0 : toCents(form.monthlyPrice),
          annualPrice: form.type === "FREE" ? 0 : toCents(form.annualPrice),
          maxClasses: Number(form.maxClasses) || 0,
          maxStudentsPerClass: Number(form.maxStudentsPerClass) || 0,
          maxScheduledTasksInClass: Number(form.maxScheduledTasksInClass) || 0,
        });
        toast.success("Package created and synced to Stripe");
      } else if (pkg) {
        await updatePlan({
          planId: pkg.id,
          body: {
            name: form.name.trim(),
            description: form.description?.trim() || undefined,
            monthlyPrice: form.type === "FREE" ? 0 : toCents(form.monthlyPrice),
            annualPrice: form.type === "FREE" ? 0 : toCents(form.annualPrice),
            maxClasses: Number(form.maxClasses) || 0,
            maxStudentsPerClass: Number(form.maxStudentsPerClass) || 0,
            maxScheduledTasksInClass: Number(form.maxScheduledTasksInClass) || 0,
            isActive: form.isActive,
          },
        });
        toast.success("Package updated and synced to Stripe");
      }
      onClose();
    } catch {
      toast.error("Failed to save package");
    }
  };

  const getTierIcon = (type: PlanType) => {
    switch (type) {
      case "PRO":
        return <Sparkles className="w-5 h-5 text-[#007EEF]" />;
      case "BASIC":
        return <Star className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-slate-600" />;
    }
  };

  const isFree = form.type === "FREE";

  const monthlyNum = parseFloat(form.monthlyPrice);
  const annualNum = parseFloat(form.annualPrice);
  const yearlyIfMonthly = monthlyNum * 12;
  const annualDiscountPct =
    !isNaN(monthlyNum) &&
    !isNaN(annualNum) &&
    monthlyNum > 0 &&
    annualNum > 0 &&
    annualNum < yearlyIfMonthly
      ? Math.round(((yearlyIfMonthly - annualNum) / yearlyIfMonthly) * 100)
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-6 sm:p-7 rounded-[24px] border border-slate-200/80 bg-white shadow-xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              {getTierIcon(form.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                  {isNew ? "Create New Package" : `Edit ${pkg?.name || "Package"}`}
                </DialogTitle>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    form.type === "PRO"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : form.type === "BASIC"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  )}
                >
                  {form.type}
                </span>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                {isNew
                  ? "Define subscription limits, pricing, and sync automatically with Stripe."
                  : `Configure limits and details for the ${pkg?.name} plan.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <div className="space-y-4 py-3">
          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Plan Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Pro Plan"
              className="h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Shown on the Stripe product and package cards (optional)"
              className="h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>

          {/* Pricing Section */}
          {isFree ? (
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-800">Free Baseline Tier</p>
                <p className="text-[11px] text-slate-500">
                  Assigned to all teachers automatically with $0 billing.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                $0.00 / Always Free
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Monthly Price ($)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthlyPrice}
                    onChange={(e) => setField("monthlyPrice", e.target.value)}
                    placeholder="9.99"
                    className="h-10 pl-7 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Annual Price ($)</Label>
                  {annualDiscountPct !== null && annualDiscountPct > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full transition-all">
                      Save {annualDiscountPct}%
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.annualPrice}
                    onChange={(e) => setField("annualPrice", e.target.value)}
                    placeholder="99.99"
                    className="h-10 pl-7 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quotas & Capacity */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Max Classes</Label>
              <Input
                type="number"
                min="0"
                value={form.maxClasses}
                onChange={(e) => setField("maxClasses", e.target.value)}
                className="h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Students / Class</Label>
              <Input
                type="number"
                min="0"
                value={form.maxStudentsPerClass}
                onChange={(e) => setField("maxStudentsPerClass", e.target.value)}
                className="h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Activities / Class</Label>
              <Input
                type="number"
                min="0"
                value={form.maxScheduledTasksInClass}
                onChange={(e) => setField("maxScheduledTasksInClass", e.target.value)}
                className="h-10 text-xs sm:text-sm font-medium rounded-xl border-slate-200/80 bg-white shadow-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>


        </div>

        {/* Footer */}
        <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none gap-2 cursor-pointer"
            style={{ boxShadow: "none" }}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isNew ? "Create Package" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
