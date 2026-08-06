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
      <div className="flex flex-col space-y-6">
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
        <div className="flex gap-4 items-stretch">
          <div className="flex-3 bg-card border border-border rounded-2xl p-5 space-y-3">
            <Skeleton className="h-6 w-32" />
            <ActiveTasksSkeleton />
          </div>
          <div className="flex-1 bg-card border border-border rounded-2xl p-5">
            <Skeleton className="h-6 w-32 mb-4" />
            <LevelSkeleton />
          </div>
        </div>

        {/* Loading Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-5">
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
    <div className="flex flex-col space-y-6">
      {/* Heading with animation */}
      <div className="animate-fade-in-up">
        <SectionHeading
          heading="Student Dashboard"
          subheading="Welcome back! Here's your learning overview for this month."
        />
      </div>

      {/* 4 stat cards with staggered animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DASHBOARD_CARDS.map((card, index) => (
          <div 
            key={index} 
            className="animate-fade-in-up hover-scale"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <DashboardStatCard {...card} />
          </div>
        ))}
      </div>

      {/* Middle row: Active Tasks (75%) + Current Level (25%) */}
      <div className="flex gap-4 items-stretch">
        {/* Active Tasks – 75% */}
        <div className="flex-3 bg-card border border-border rounded-2xl p-5 space-y-3 animate-slide-in-left">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-foreground">
              Active Tasks
            </h3>
            {scheduledTasks?.meta && (
              <span className="text-sm text-muted-foreground">
                Total: {scheduledTasks.meta.total} tasks
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isTasksLoading ? (
              <ActiveTasksSkeleton />
            ) : scheduledTasks?.data?.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground animate-fade-in-up">
                No active tasks found. Check back later for new tasks!
              </div>
            ) : (
              scheduledTasks?.data?.map((task, index) => (
                <div 
                  key={index} 
                  className="animate-fade-in-up hover-scale"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ActiveTaskCard task={task} />
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {scheduledTasks?.meta && scheduledTasks.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 animate-fade-in-up">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, scheduledTasks.meta.total)} of{" "}
                {scheduledTasks.meta.total} tasks
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm font-medium">{currentPage}</span>
                  <span className="text-sm text-muted-foreground">of</span>
                  <span className="text-sm font-medium">{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Current Level – 25% */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-4 animate-slide-in-right">
          <h3 className="font-semibold text-base text-foreground self-start">
            Current Level
          </h3>
          <div className="flex flex-col items-center gap-3 flex-1 justify-center">
            <div 
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 animate-pulse-slow"
              style={{
                background: "linear-gradient(135deg,#2F7EDA 0%,#72B0F8 100%)",
                border: "3px solid #255DEB",
              }}
            >
              <GraduationCap className="w-8 h-8 text-white mb-1" />
              <span className="text-white font-extrabold text-lg leading-none">
                {dashboardData?.level?.level?.toString() ?? "0"}
              </span>
            </div>
            <p className="text-center text-sm font-semibold text-foreground">
              Level {dashboardData?.level?.level?.toString() ?? "0"}
            </p>
            <p className="text-center text-xs text-muted-foreground">
              {dashboardData?.level?.level && dashboardData.level.level > 10 
                ? "Master Learner" 
                : dashboardData?.level?.level && dashboardData.level.level > 5 
                ? "Advanced Learner" 
                : "Active Learner"}
            </p>
            <div className="w-full">
              <div className="flex justify-center text-xs text-muted-foreground mb-1">
                {dashboardData?.level?.totalXp ?? 0} XP
              </div>
              <Progress 
                value={dashboardData?.level?.xpNeededForNextLevel ?? 0} 
                className="h-2 transition-all duration-500" 
              />
              <p className="text-xs text-muted-foreground text-center mt-1">
                {dashboardData?.level?.xpNeededForNextLevel ?? 0} XP to Level{" "}
                {(dashboardData?.level?.level ?? 0) + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity – full width */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <RecentActivity items={dashboardData?.recentActivity ?? []} />
      </div>
    </div>
  );
};