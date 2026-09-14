'use client';
import { Check, Clipboard, TrendingUp, Users, ArrowRight, Calendar, Download } from "lucide-react";
import { SectionHeading, StateCard } from "../reusable";
import { ActiveTaskCard } from "../student/dashboard/ActiveTaskCard";
import { useGetAllScheduledTasksQuery } from "@/api/task";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useGetTeacherAnalyticsSummaryQuery } from "@/api/analytics";
import { cn } from "@/lib/utils";

export const TeacherDashboard = () => {
  const { data: teacherAnalyticsSummary, isLoading: teacherAnalyticsLoading } = useGetTeacherAnalyticsSummaryQuery();
  
  const stats = [
    { icon: Users, title: "Total Students", value: teacherAnalyticsSummary?.totalStudents || 0, trend: 15.5, subtitle: "vs. 14,653 last period" },
    { icon: Clipboard, title: "Assigned Tasks", value: teacherAnalyticsSummary?.totalTasks || 0, trend: 8.4, subtitle: "vs. 5,732 last period" },
    { icon: Check, title: "Active Classes", value: teacherAnalyticsSummary?.totalClasses || 0, trend: -10.5, subtitle: "vs. 3,294 last period" },
    { icon: TrendingUp, title: "Average Score", value: `${teacherAnalyticsSummary?.overallAvgScore || 0}%`, trend: 4.4, subtitle: "vs. 1,186 last period" },
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Overview of class activity, progress, and performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl border-slate-200 text-slate-600 font-medium text-xs h-9">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Jan 1, 2026 - Feb 1, 2026
          </Button>
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3454FB] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/15 transition-colors hover:bg-[#2B44C9]"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Link>
        </div>
      </div>

      {/* Stats Grid with Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="animate-in fade-in slide-in-from-bottom-3 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StateCard
              icon={item.icon}
              title={item.title}
              value={item.value}
              trend={item.trend}
              subtitle={item.subtitle}
            />
          </div>
        ))}
      </div>

      {/* Active Tasks Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold tracking-tight text-slate-800">
              Active Tasks
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Track and manage ongoing assignments
            </p>
          </div>
          {scheduledTasks?.meta && (
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-50/70 border border-blue-100 px-3 py-1 text-xs font-semibold text-[#3454FB]">
                Total: {scheduledTasks.meta.total} tasks
              </div>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              </div>
              <p className="text-muted-foreground animate-pulse">Loading tasks...</p>
            </div>
          ) : scheduledTasks?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Clipboard className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground font-medium">No active tasks</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  All caught up! New tasks will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
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

        {/* Enhanced Pagination */}
        {scheduledTasks?.meta && scheduledTasks.meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full w-fit">
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, scheduledTasks.meta.total)} of{" "}
              {scheduledTasks.meta.total} tasks
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  currentPage !== 1 && "hover:scale-105"
                )}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  currentPage !== 1 && "hover:scale-105"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/5 border">
                <span className="text-sm font-semibold text-primary">{currentPage}</span>
                <span className="text-xs text-muted-foreground">of</span>
                <span className="text-sm font-medium text-foreground">{totalPages}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  currentPage !== totalPages && "hover:scale-105"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={cn(
                  "h-9 w-9 p-0 transition-all duration-200",
                  currentPage !== totalPages && "hover:scale-105"
                )}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
