'use client';
import { Check, Clipboard, TrendingUp, Users, Calendar, Clock, Activity } from "lucide-react";
import { SectionHeading, StateCard } from "../reusable";
import { ActiveTaskCard } from "../student/dashboard/ActiveTaskCard";
import { useGetAllScheduledTasksQuery } from "@/api/task";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    { 
      icon: Users, 
      title: "Total Students", 
      value: teacherAnalyticsSummary?.totalStudents || 0,
      trend: "+12%",
      trendUp: true,
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: Clipboard, 
      title: "Total Tasks", 
      value: teacherAnalyticsSummary?.totalTasks || 0,
      trend: "+8%",
      trendUp: true,
      color: "from-purple-500 to-purple-600"
    },
    { 
      icon: Check, 
      title: "Active Classes", 
      value: teacherAnalyticsSummary?.totalClasses || 0,
      trend: "+5%",
      trendUp: true,
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      icon: TrendingUp, 
      title: "Avg Score", 
      value: `${teacherAnalyticsSummary?.overallAvgScore || 0}`,
      trend: "+3%",
      trendUp: true,
      color: "from-orange-500 to-orange-600"
    },
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
    <div className="space-y-8 bg-linear-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <SectionHeading
            heading="Dashboard"
            subheading="Here's what's happening in your classes today."
          />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Action Button */}
        <Button className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <Activity className="w-4 h-4" />
          View Activity Log
        </Button>
      </div>

      {/* Stats Grid with Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            />
          </div>
        ))}
      </div>

      {/* Active Tasks Section */}
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Active Tasks
            </h3>
            <p className="text-sm text-muted-foreground">
              Track and manage ongoing assignments
            </p>
          </div>
          {scheduledTasks?.meta && (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Total: {scheduledTasks.meta.total} tasks
              </div>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
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

      {/* Optional: Quick Stats Footer */}
      {teacherAnalyticsSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">
              {teacherAnalyticsSummary.totalClasses || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total Classes</p>
          </div>
          <div className="bg-linear-to-br from-blue-500/5 to-blue-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {teacherAnalyticsSummary.totalStudents || 0}
            </p>
            <p className="text-xs text-muted-foreground">Enrolled Students</p>
          </div>
          <div className="bg-linear-to-br from-emerald-500/5 to-emerald-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {teacherAnalyticsSummary.totalTasks || 0}
            </p>
            <p className="text-xs text-muted-foreground">Assigned Tasks</p>
          </div>
          <div className="bg-linear-to-br from-orange-500/5 to-orange-500/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {teacherAnalyticsSummary.overallAvgScore || 0}
            </p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </div>
        </div>
      )}
    </div>
  );
};