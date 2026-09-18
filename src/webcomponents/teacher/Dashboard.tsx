'use client';
import { Check, Clipboard, TrendingUp, Users, ArrowRight, Calendar, Download } from "lucide-react";
import { SectionHeading } from "../reusable";
import { ActiveTaskCard } from "../student/dashboard/ActiveTaskCard";
import { useGetAllScheduledTasksQuery } from "@/api/task";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useGetTeacherAnalyticsSummaryQuery } from "@/api/analytics";
import { cn } from "@/lib/utils";

// ── Skeleton helpers ───────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    </div>
  );
}

function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export const TeacherDashboard = () => {
  const { data: teacherAnalyticsSummary, isLoading: teacherAnalyticsLoading } = useGetTeacherAnalyticsSummaryQuery();
  
  const stats = [
    { icon: Users, title: "Total Students", value: teacherAnalyticsSummary?.totalStudents || 0, trend: 15.5, subtitle: "vs. last period" },
    { icon: Clipboard, title: "Assigned Tasks", value: teacherAnalyticsSummary?.totalTasks || 0, trend: 8.4, subtitle: "vs. last period" },
    { icon: Check, title: "Active Classes", value: teacherAnalyticsSummary?.totalClasses || 0, trend: -10.5, subtitle: "vs. last period" },
    { icon: TrendingUp, title: "Average Score", value: `${teacherAnalyticsSummary?.overallAvgScore || 0}%`, trend: 4.4, subtitle: "vs. last period" },
  ];

  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: scheduledTasks, isLoading: tasksLoading } = useGetAllScheduledTasksQuery({ 
    page, 
    limit 
  });

  const totalPages = scheduledTasks?.meta?.totalPages || 1;
  const currentPage = scheduledTasks?.meta?.page || page;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const isLoading = teacherAnalyticsLoading || tasksLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <SectionHeading
        heading="Dashboard"
        subheading="Overview of class activity, progress, and performance."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-2 rounded-xl border-slate-200/70 text-slate-600 font-medium text-xs h-9 shadow-none"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Jan 1, 2026 – Feb 1, 2026
            </Button>
            <Link
              href="/classes"
              className="inline-flex items-center gap-2 rounded-xl bg-[#007EEF] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0066cc] shadow-none border-none"
              style={{ boxShadow: "none" }}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((item, index) => (
              <StatCard key={index} index={index} item={item} />
            ))}
      </div>

      {/* Active Tasks */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold tracking-tight text-slate-800">Active Tasks</h3>
            <p className="text-xs text-slate-400 font-medium">Track and manage ongoing assignments</p>
          </div>
          {scheduledTasks?.meta && !isLoading && (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 border border-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Total: {scheduledTasks.meta.total} tasks
              </div>
            </div>
          )}
        </div>

        {/* Tasks container */}
        <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-none">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 4 }).map((_, i) => <TaskRowSkeleton key={i} />)}
            </div>
          ) : scheduledTasks?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Clipboard className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">No active tasks</p>
                <p className="text-xs text-slate-400 mt-1">All caught up! New tasks will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {scheduledTasks?.data?.map((task, i) => (
                <div
                  key={i}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <ActiveTaskCard task={task} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {scheduledTasks?.meta && scheduledTasks.meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-full w-fit">
              Showing {(currentPage - 1) * limit + 1}–
              {Math.min(currentPage * limit, scheduledTasks.meta.total)} of {scheduledTasks.meta.total} tasks
            </p>
            <div className="flex items-center gap-1.5">
              <PaginationBtn onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></PaginationBtn>
              <PaginationBtn onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></PaginationBtn>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-xs font-semibold text-primary">{currentPage}</span>
                <span className="text-xs text-slate-400">of</span>
                <span className="text-xs font-medium text-slate-700">{totalPages}</span>
              </div>
              <PaginationBtn onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></PaginationBtn>
              <PaginationBtn onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></PaginationBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function PaginationBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 p-0 rounded-lg border-slate-200/70 shadow-none hover:bg-primary/5 hover:text-primary hover:border-primary/30 disabled:opacity-40"
    >
      {children}
    </Button>
  );
}

function StatCard({ item, index }: { item: { icon: React.ElementType; title: string; value: string | number; trend: number; subtitle: string }; index: number }) {
  const Icon = item.icon;
  const isPositive = item.trend > 0;

  return (
    <div
      className="rounded-xl border border-slate-200/70 bg-white shadow-none p-5 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className={cn(
          "inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? "+" : ""}{item.trend}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{item.value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{item.title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
      </div>
    </div>
  );
}
