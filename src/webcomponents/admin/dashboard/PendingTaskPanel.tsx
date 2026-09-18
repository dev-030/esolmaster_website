"use client";

import { useState } from "react";
import { PendingTaskCard } from "./PendingTaskCard";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Pagination } from "@/webcomponents/reusable";
import { useApproveTaskMutation, useGetTasks, useRejectTaskMutation } from "@/api/task";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 4;

export const PendingTaskPanel = () => {
  const [page, setPage] = useState(1);

  const { data: tasksData, isLoading } = useGetTasks({
    page: page,
    limit: PAGE_SIZE,
    status: "PENDING_APPROVAL",
  });
  const { mutateAsync: approveTask } = useApproveTaskMutation();
  const { mutateAsync: rejectTask } = useRejectTaskMutation();

  const handleApprove = async (id: string) => {
    await approveTask(id, {
      onSuccess: () => {
        toast.success("Task approved successfully");
      }
    });
  };

  const handleReject = async (id: string) => {
    await rejectTask(id, {
      onSuccess: () => {
        toast.success("Task rejected successfully", {
          richColors: true,
        });
      }
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-slate-900">
            Pending Task Approval
          </h3>
        </div>
        {tasksData?.meta?.total !== undefined && tasksData.meta.total > 0 && (
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
            {tasksData.meta.total} pending
          </span>
        )}
      </div>

      {/* Task list */}
      <div className="flex flex-col divide-y divide-slate-100 flex-1 min-h-[220px]">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-3.5">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40 bg-slate-100" />
                  <Skeleton className="h-4 w-16 rounded-md bg-slate-100" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24 bg-slate-100" />
                  <Skeleton className="h-3 w-32 bg-slate-100" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))
        ) : tasksData?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center my-auto">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-800">All caught up</p>
              <p className="text-xs text-slate-400 mt-0.5">No activities are waiting for approval.</p>
            </div>
          </div>
        ) : (
          tasksData?.data?.map((task) => (
            <PendingTaskCard
              key={task.id}
              task={task}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {tasksData?.meta?.total && tasksData.meta.total > PAGE_SIZE && (
        <div className="pt-2 border-t border-slate-100">
          <Pagination
            page={page}
            totalItems={tasksData.meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            className="border-t-0 bg-white px-0"
          />
        </div>
      )}
    </div>
  );
};
