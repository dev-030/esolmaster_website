'use client';
import { SectionHeading } from "@/webcomponents/reusable"
import { Calendar, CheckCircle2, Download, Users, Zap } from "lucide-react"
import { StatCard, StatCardItem } from "./StatCard"
import { EngagementChartCard } from "./EngagementCard"
import { PopularTasksCard } from "./PopulerTask"
import { useGetAdminPlatformAnalyticsQuery } from "@/api/admin";



export const Analysis = () => {
  const { data: platformAnalytics , isLoading } = useGetAdminPlatformAnalyticsQuery();
  const statCards: StatCard[] = [
  {
    title: platformAnalytics?.statCards[0].title || "Total Tasks Created",
    value: platformAnalytics?.statCards[0].value || 0,
    icon: <Users size={22} />,
    bgColor: "#6366F11A",
    borderColor: "#736BFF",
    iconColor: "#4F46E5",
    change: platformAnalytics?.statCards[0].change || 0,
  },
  {
    title: platformAnalytics?.statCards[1].title || "Total Teachers",
    value: platformAnalytics?.statCards[1].value || 3157,
    icon: <Zap size={22} />,
    bgColor: "#E4EBFF",
    borderColor: "#6C9DFF",
    iconColor: "#4661E5",
    change: platformAnalytics?.statCards[1].change || -4.2,
  },
  {
    title: platformAnalytics?.statCards[2].title || "Total Students",
    value: platformAnalytics?.statCards[2].value || 19840,
    icon: <CheckCircle2 size={22} />,
    bgColor: "#F2E4FF",
    borderColor: "#B96BFF",
    iconColor: "#9333EA",
    change: platformAnalytics?.statCards[2].change || 8.7,
  },
]
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <SectionHeading
          heading="Platform Analytics"
          subheading="Deep dive into usage statistics and engagement metrics"
        />
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#047481" }}
          >
            <Calendar size={13} />
            Last 7 days
          </span>
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors px-3 py-1.5 rounded-lg shadow-sm">
            <Download size={13} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCardItem key={i} card={card} />
        ))}
      </div>

      {/* Charts */}
      <EngagementChartCard engagementData={platformAnalytics?.engagementData} />
      <PopularTasksCard popularTasksData={platformAnalytics?.popularTasksData} />
    </div>
  )
}