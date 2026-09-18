"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Crown, X } from "lucide-react";
import { toast } from "sonner";
import {
  useAttachPremiumTasksMutation,
  useDetachPremiumTaskMutation,
  useGetPlanPremiumTasksQuery,
} from "@/api/payment";
import { useGetTasks } from "@/api/task";
import { AdminPlan, PlanPremiumTaskLink } from "@/types/payment";
import { Task } from "@/types/task";

export const PremiumTasksDialog = ({
  pkg,
  open,
  onClose,
}: {
  pkg: AdminPlan | null;
  open: boolean;
  onClose: () => void;
}) => {
  const planId = pkg?.id ?? "";
  const { data: attached, isLoading: loadingAttached } =
    useGetPlanPremiumTasksQuery(planId);
  const { data: premiumTasksPage, isLoading: loadingPremium } = useGetTasks({
    isPremium: true,
    limit: 50,
  });

  const { mutateAsync: attachTasks, isPending: attaching } =
    useAttachPremiumTasksMutation();
  const { mutateAsync: detachTask, isPending: detaching } =
    useDetachPremiumTaskMutation();

  const [selected, setSelected] = useState<string[]>([]);

  const attachedIds = new Set(
    (attached ?? []).map((a: PlanPremiumTaskLink) => a.taskId),
  );
  const availableTasks = (premiumTasksPage?.data ?? []).filter(
    (t: Task) => !attachedIds.has(t.id),
  );

  const toggleSelected = (taskId: string) => {
    setSelected((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

  const handleAttach = async () => {
    if (!selected.length) return;
    try {
      await attachTasks({ planId, taskIds: selected });
      toast.success("Premium tasks added to package");
      setSelected([]);
    } catch {
      toast.error("Failed to attach tasks");
    }
  };

  const handleDetach = async (taskId: string) => {
    try {
      await detachTask({ planId, taskId });
      toast.success("Task removed from package");
    } catch {
      toast.error("Failed to remove task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg w-full p-6 sm:p-7 rounded-[24px] border border-slate-200/80 bg-white shadow-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Premium Activities · {pkg?.name}
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Attach interactive premium tasks that are gated to this package.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {/* Attached tasks */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Included in this package
            </p>
            {loadingAttached && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading attached activities...
              </div>
            )}
            {!loadingAttached && (attached ?? []).length === 0 && (
              <p className="text-xs text-slate-400 italic py-1">
                No premium activities attached yet.
              </p>
            )}
            <div className="space-y-1.5">
              {(attached ?? []).map((link: PlanPremiumTaskLink) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 px-3.5 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60 uppercase">
                      {link.task.type}
                    </span>
                    <span className="font-semibold text-slate-800">{link.task.title}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    disabled={detaching}
                    onClick={() => handleDetach(link.taskId)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Available premium tasks */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Available premium activities
            </p>
            {loadingPremium && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading available activities...
              </div>
            )}
            {!loadingPremium && availableTasks.length === 0 && (
              <p className="text-xs text-slate-400 italic py-1">
                No unattached premium activities found. Mark an activity as premium in Content Library.
              </p>
            )}
            <div className="space-y-1.5">
              {availableTasks.map((t: Task) => (
                <label
                  key={t.id}
                  className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                    selected.includes(t.id)
                      ? "border-primary/50 bg-primary/5"
                      : "border-slate-200/70 bg-white hover:bg-slate-50/70"
                  }`}
                >
                  <Checkbox
                    checked={selected.includes(t.id)}
                    onCheckedChange={() => toggleSelected(t.id)}
                    className="rounded-md"
                  />
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60 uppercase">
                    {t.type}
                  </span>
                  <span className="font-medium text-slate-800">{t.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold text-slate-600 shadow-none hover:bg-slate-50 cursor-pointer"
          >
            Close
          </Button>
          <Button
            onClick={handleAttach}
            disabled={!selected.length || attaching}
            size="sm"
            className="h-9 px-5 rounded-xl text-xs font-semibold bg-[#007EEF] hover:bg-[#0066cc] text-white shadow-none gap-1.5 cursor-pointer"
            style={{ boxShadow: "none" }}
          >
            {attaching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Add {selected.length > 0 ? `${selected.length} ` : ""}to Package
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
