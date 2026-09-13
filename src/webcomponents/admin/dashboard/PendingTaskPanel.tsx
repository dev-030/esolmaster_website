"use client";

import { useState } from "react";
import {  PendingTaskCard } from "./PendingTaskCard";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Pagination } from "@/webcomponents/reusable";
import { useApproveTaskMutation, useGetTasks, useRejectTaskMutation } from "@/api/task";
import { toast } from "sonner";

const PAGE_SIZE = 4;


export const PendingTaskPanel = () => {
  const [page, setPage] = useState(1);

  const { data: tasksData, isLoading } = useGetTasks({
    page: page,
    limit: PAGE_SIZE,
    status: "PENDING_APPROVAL",
  });
  const { mutateAsync:approveTask, isPending: isApproving } =useApproveTaskMutation();
  const { mutateAsync:rejectTask, isPending: isRejecting } =useRejectTaskMutation();

  const handleApprove = async (id: string) => {
    await approveTask(id,{
      onSuccess: () => {
        toast.success("Task approved successfully");
      }
    });
  };

  const handleReject = async (id: string) => {
    await rejectTask(id,{
      onSuccess: () => {
        toast.success("Task rejected successfully",{
          richColors: true,
        });
      }
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ClipboardList size={18} className="text-[#2F7EDA]" />
        <h3 className="text-base font-semibold text-slate-900">
          Pending Task Approval
        </h3>
      </div>

      <Separator />

      {/* Task list */}
      <div className="flex flex-col divide-y divide-gray-100 flex-1">
        {tasksData?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">All caught up</p>
            <p className="text-xs text-slate-400">No activities are waiting for approval.</p>
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
      <div className="pt-2">
        <Pagination
          page={page}
          totalItems={tasksData?.meta?.total || 0}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
