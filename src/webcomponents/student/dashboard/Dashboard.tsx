"use client";

import { BookOpen, Flame, GraduationCap, Trophy, Zap } from "lucide-react";
import { ActiveTaskCard } from "./ActiveTaskCard";
import { DashboardStatCard } from "./DashboardStatCard";
import { RecentActivity } from "./RecentActivity";
import { SectionHeading } from "../../reusable/SectionHeading";
import { Progress } from "@/components/ui/progress";
import { useGetAllScheduledTasksQuery } from "@/api/task";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useGetStudentDashboardQuery } from "@/api/student";
import { Skeleton } from "@/components/ui/skeleton";

// Animation styles to be added to your global CSS or as a style tag
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.5s ease-out forwards;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.5s ease-out forwards;
  }

  .hover-scale {
    transition: transform 0.2s ease-in-out;
  }

  .hover-scale:hover {
    transform: translateY(-2px);
  }

  .shimmer-loading {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;

// Loading Skeleton Components
const StatCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-20" />
  </div>
);

const ActiveTasksSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    ))}
  </div>
);

const LevelSkeleton = () => (
  <div className="flex flex-col items-center gap-3 flex-1 justify-center">
    <Skeleton className="w-24 h-24 rounded-full" />
    <Skeleton className="h-5 w-20" />
    <Skeleton className="h-4 w-32" />
    <div className="w-full">
      <Skeleton className="h-2 w-full mb-1" />
      <Skeleton className="h-3 w-24 mx-auto" />
    </div>
  </div>
);

export const StudentDashboard = () => {
  const [page, setPage] = useState(1);
  const limit = 4;

  // Add styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = animationStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const { 
    data: scheduledTasks, 
    isLoading: isTasksLoading,
    isError: isTasksError,
    refetch: refetchTasks 
  } = useGetAllScheduledTasksQuery({
    page,
    limit,
  });

  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch: refetchDashboard 
  } = useGetStudentDashboardQuery();

  const totalPages = scheduledTasks?.meta?.totalPages || 1;
  const currentPage = scheduledTasks?.meta?.page || page;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleRetry = () => {
    refetchTasks();
    refetchDashboard();
  };

  const DASHBOARD_CARDS = [
    {
      title: "Total Tasks",
      value: dashboardData?.stats?.totalScheduledTasks?.currentMonth?.toString() ?? "0",
      change: dashboardData?.stats?.totalScheduledTasks?.changePercentage ?? 0,
      trend: dashboardData?.stats?.totalScheduledTasks?.trend ?? "neutral",
      icon: Trophy,
      gradient: "bg-[linear-gradient(135deg,#0ABA10_0%,#3DC141_86%,#00C006_100%)]",
      strokeColor: "#01CA18",
      iconBg: "rgba(1,202,24,0.4)",
    },
    {
      title: "Tasks Done",
      value: dashboardData?.stats?.completedTasks?.currentMonth?.toString() ?? "0",
      change: dashboardData?.stats?.completedTasks?.changePercentage ?? 0,
      trend: dashboardData?.stats?.completedTasks?.trend ?? "neutral",
      icon: BookOpen,
      gradient: "bg-[linear-gradient(135deg,#6699FF_0%,#799EE9_100%,#4A86FF_49%)]",
      strokeColor: "#1476D2",
      iconBg: "rgba(20,118,210,0.4)",
    },
    {
      title: "XP Earned",
      value: dashboardData?.stats?.xpEarned?.currentMonth?.toString() ?? "0",
      change: dashboardData?.stats?.xpEarned?.changePercentage ?? 0,
      trend: dashboardData?.stats?.xpEarned?.trend ?? "neutral",
      icon: Zap,
      gradient: "bg-[linear-gradient(135deg,#E2B810_0%,#E8C53C_100%,#DDB824_58%)]",
      strokeColor: "#DEB613",
      iconBg: "rgba(222,182,19,0.4)",
    },
    {
      title: "Streak Days",
      value: dashboardData?.stats?.currentStreak?.toString() ?? "0",
      icon: Flame,
      gradient: "bg-[linear-gradient(135deg,#8077FF_0%,#7871DE_100%,#857CFF_96%)]",
      strokeColor: "#1A0DD0",
      iconBg: "rgba(26,13,208,0.4)",
    },
  ];

  // Error State
  if (isTasksError || isDashboardError) {
    return (
      <div className="min-h-screen space-y-6 bg-[#F7F9FC]">
        <SectionHeading
          heading="Student Dashboard"
          subheading="Welcome back! Here's your learning overview for this month."
        />
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your connection and try again
            </p>
          </div>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Loading State with animations
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="shimmer-loading rounded-lg h-16 w-full" />
        
        {/* Loading Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <StatCardSkeleton />
            </div>
          ))}
        </div>

        {/* Loading Active Tasks and Level */}
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,.75fr)]">
          <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <Skeleton className="h-6 w-32" />
            <ActiveTasksSkeleton />
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <Skeleton className="h-6 w-32 mb-4" />
            <LevelSkeleton />
          </div>
        </div>

        {/* Loading Recent Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shopeers-style Top Header Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Keep learning at your pace and stay on top of your progress.
          </p>
        </div>

        {/* Action Controls from Reference */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
            <span className="text-slate-400">📅</span>
            <span>Jan 1, 2025 - Feb 1, 2025</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
            <span>Last 30 days</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            Add widget
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-[#3454FB] hover:bg-[#2842D8] px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-500/15 transition-all"
          >
            Export
          </button>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD_CARDS.map((card, index) => (
          <DashboardStatCard key={index} {...card} />
        ))}
      </div>

      {/* Middle row: Active Tasks (70%) + Current Level (30%) */}
      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        {/* Active Tasks */}
        <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base text-slate-800 tracking-tight">
                Active Tasks
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Tasks currently scheduled and open for you
              </p>
            </div>
            {scheduledTasks?.meta && (
              <span className="text-xs font-semibold text-slate-500 rounded-full bg-slate-50 border border-slate-100 px-3 py-1">
                {scheduledTasks.meta.total} tasks total
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {isTasksLoading ? (
              <ActiveTasksSkeleton />
            ) : scheduledTasks?.data?.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400 text-xs font-medium">
                No active tasks right now. Check back soon for new assignments!
              </div>
            ) : (
              scheduledTasks?.data?.map((task, index) => (
                <ActiveTaskCard key={index} task={task} />
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {scheduledTasks?.meta && scheduledTasks.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-medium">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, scheduledTasks.meta.total)} of{" "}
                {scheduledTasks.meta.total} tasks
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 rounded-[10px] border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-600">
                  <span>{currentPage}</span>
                  <span className="text-slate-400">/</span>
                  <span>{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 rounded-[10px] border-slate-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Current Level Widget */}
        <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base text-slate-800 tracking-tight">
              Current Level
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Your overall ranking and XP milestones
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#3454FB] to-[#5572FF] shadow-lg shadow-blue-500/20">
              <div className="flex flex-col items-center justify-center text-white">
                <GraduationCap className="w-7 h-7 mb-0.5" />
                <span className="text-xl font-bold leading-none">
                  {dashboardData?.level?.level?.toString() ?? "1"}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              Level {dashboardData?.level?.level?.toString() ?? "1"}
            </p>
            <span className="mt-0.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#3454FB]">
              {dashboardData?.level?.level && dashboardData.level.level > 10
                ? "Master Learner"
                : dashboardData?.level?.level && dashboardData.level.level > 5
                ? "Advanced Learner"
                : "Active Learner"}
            </span>
          </div>

          <div className="w-full space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Total Progress</span>
              <span className="text-[#3454FB] font-bold">{dashboardData?.level?.totalXp ?? 0} XP</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3454FB] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    ((dashboardData?.level?.totalXp ?? 0) /
                      Math.max((dashboardData?.level?.xpNeededForNextLevel ?? 100) + (dashboardData?.level?.totalXp ?? 0), 1)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium text-center">
              {dashboardData?.level?.xpNeededForNextLevel ?? 0} XP needed for Level{" "}
              {(dashboardData?.level?.level ?? 0) + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity items={dashboardData?.recentActivity ?? []} />
    </div>
  );
};
