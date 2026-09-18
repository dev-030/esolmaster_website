'use client';
import { useState, useEffect } from "react";
import { SectionHeading } from "@/webcomponents/reusable";
import { StatCard, StatCardItem } from "./StatCardItem";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { PendingTaskPanel } from "./PendingTaskPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { useGetAdminDashboardQuery } from "@/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export const AdminDashboard = () => {
  const { data: adminDashboardData, isLoading } = useGetAdminDashboardQuery();
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    if (adminDashboardData) {
      setCachedData(adminDashboardData);
    }
  }, [adminDashboardData]);

  const dashboardData = adminDashboardData || cachedData;

  const statCards: StatCard[] = [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers?.value || 0,
      icon: <Users size={18} />,
      iconContainerClass: "bg-slate-100/80 border-slate-200/60 text-slate-600",
      change: dashboardData?.totalUsers?.changePercentage || 0,
      direction: dashboardData?.totalUsers?.direction || "neutral",
    },
    {
      title: "Active Tasks",
      value: dashboardData?.totalScheduledTasks?.value || 0,
      icon: <BookOpen size={18} />,
      iconContainerClass: "bg-primary/10 border-primary/20 text-primary",
      change: dashboardData?.totalScheduledTasks?.changePercentage || 0,
      direction: dashboardData?.totalScheduledTasks?.direction || "neutral",
    },
    {
      title: "Tasks Completed",
      value: dashboardData?.completedScheduledTasks?.value || 0,
      icon: <CheckCircle2 size={18} />,
      iconContainerClass: "bg-emerald-50 border-emerald-200/60 text-emerald-600",
      change: dashboardData?.completedScheduledTasks?.changePercentage || 0,
      direction: dashboardData?.completedScheduledTasks?.direction || "neutral",
    },
    {
      title: "New Signups",
      value: dashboardData?.newSignups?.value || 0,
      icon: <ClipboardList size={18} />,
      iconContainerClass: "bg-sky-50 border-sky-200/60 text-sky-600",
      change: dashboardData?.newSignups?.changePercentage || 0,
      direction: dashboardData?.newSignups?.direction || "neutral",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7">
      <SectionHeading
        heading="Admin Dashboard"
        subheading="Monitor platform activity and keep learning content moving."
        action={
          <Link 
            href="/assign-task" 
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white hover:bg-primary/5 hover:text-primary hover:border-primary/30 px-3.5 h-9 text-xs sm:text-[13px] font-medium text-slate-700 shadow-none transition-colors cursor-pointer"
          >
            Activity Builder <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {/* Stat Cards - With Skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading && !dashboardData ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-none flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3.5 w-20 bg-slate-100" />
                <Skeleton className="h-9 w-9 rounded-lg bg-slate-100 shrink-0" />
              </div>
              <Skeleton className="h-7 w-16 bg-slate-100 mt-1" />
              <Skeleton className="h-3.5 w-28 bg-slate-100 mt-2.5" />
            </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <div key={i} className="min-w-0">
              <StatCardItem card={card} />
            </div>
          ))
        )}
      </div>

      {/* Bottom: 75/25 split */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        {/* 75% — Pending Tasks */}
        <div className="xl:col-span-2">
          <PendingTaskPanel />
        </div>

        {/* 25% — Recent Activity */}
        <div className="xl:col-span-1">
          <RecentActivityPanel 
            activities={dashboardData?.recentActivities || []} 
            isLoading={isLoading && !dashboardData} 
          />
        </div>
      </div>
    </div>
  );
};
