'use client';
import { SectionHeading } from "@/webcomponents/reusable";
import { StatCard, StatCardItem } from "./StatCardItem";
import { BookOpen, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { PendingTaskPanel } from "./PendingTaskPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { useGetAdminDashboardQuery } from "@/api/admin";



export const AdminDashboard = () => {
  const { data: adminDashboardData,isLoading } = useGetAdminDashboardQuery();

  const statCards: StatCard[] = [
  {
    title: "Total Users",
    value: adminDashboardData?.totalUsers?.value || 0,
    icon: <Users size={20} />,
    bgColor: "#E7E5FF",
    iconBg: "#6E2FDA1A",
    iconColor: "#4338CA",
    change: adminDashboardData?.totalUsers?.changePercentage || 0,
    direction: adminDashboardData?.totalUsers?.direction || "neutral",
  },
  {
    title: "Active Tasks",
    value: adminDashboardData?.totalScheduledTasks?.value || 0,
    icon: <BookOpen size={20} />,
    bgColor: "#E5F1FF",
    iconBg: "#2F7EDA1A",
    iconColor: "#1D4ED8",
    change: adminDashboardData?.totalScheduledTasks?.changePercentage || 0,
    direction: adminDashboardData?.totalScheduledTasks?.direction || "neutral",
  },
  {
    title: "Tasks Completed",
    value: adminDashboardData?.completedScheduledTasks?.value || 0,
    icon: <CheckCircle2 size={20} />,
    bgColor: "#E5FFEF",
    iconBg: "#38DA2F1A",
    iconColor: "#139D46",
    change: adminDashboardData?.completedScheduledTasks?.changePercentage || 0,
    direction: adminDashboardData?.completedScheduledTasks?.direction || "neutral",
  },
  {
    title: "New Signups",
    value: adminDashboardData?.newSignups?.value || 0,
    icon: <ClipboardList size={20} />,
    bgColor: "#F3FFE6",
    iconBg: "#8EEA3340",
    iconColor: "#528F1A",
    change: adminDashboardData?.newSignups?.changePercentage || 0,
    direction: adminDashboardData?.newSignups?.direction || "neutral",
  },
];
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        heading="Admin Dashboard"
        subheading="Manage your application settings and user accounts."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCardItem key={i} card={card} />
        ))}
      </div>

      {/* Bottom: 75/25 split */}
      <div className="grid grid-cols-4 gap-4 items-start">
        {/* 75% — Pending Tasks */}
        <div className="col-span-3">
          <PendingTaskPanel />
        </div>

        {/* 25% — Recent Activity */}
        <div className="col-span-1">
          <RecentActivityPanel activities={adminDashboardData?.recentActivities || []} />
        </div>
      </div>
    </div>
  );
};
