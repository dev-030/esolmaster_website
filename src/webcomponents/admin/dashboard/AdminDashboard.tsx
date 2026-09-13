'use client';
import { SectionHeading } from "@/webcomponents/reusable";
import { StatCard, StatCardItem } from "./StatCardItem";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Users } from "lucide-react";
import { PendingTaskPanel } from "./PendingTaskPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { useGetAdminDashboardQuery } from "@/api/admin";
import Link from "next/link";



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
    <div className="min-h-screen space-y-8 bg-[#F7F9FC]">
      <SectionHeading
        heading="Admin Dashboard"
        subheading="Monitor platform activity and keep learning content moving."
      />

      <div className="flex flex-col gap-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#2F7EDA] to-[#235EB1] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">Admin workspace</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight">Keep your learning platform moving.</h2>
          <p className="mt-1 max-w-xl text-sm text-blue-100">Review activities, monitor platform health, and keep teachers and learners on track.</p>
        </div>
        <Link href="/assign-task" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#2F7EDA] shadow-sm transition hover:bg-blue-50">
          Activity Builder <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="min-w-0"><StatCardItem card={card} /></div>
        ))}
      </div>

      {/* Bottom: 75/25 split */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
        {/* 75% — Pending Tasks */}
        <div className="xl:col-span-2">
          <PendingTaskPanel />
        </div>

        {/* 25% — Recent Activity */}
        <div className="xl:col-span-1">
          <RecentActivityPanel activities={adminDashboardData?.recentActivities || []} />
        </div>
      </div>
    </div>
  );
};
