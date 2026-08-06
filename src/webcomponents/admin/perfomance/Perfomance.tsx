"use client";
import { SectionHeading } from "@/webcomponents/reusable";
import { Calendar, Download } from "lucide-react";
import { TeacherActivityCard } from "./TeacherActivity";
import { LearnerProgressCard } from "./LearnerProgressCard";
import { TopTeachersTable } from "./TopTeacherTable";
import {
  useExportAdminPerformanceMutation,
  useGetAdminPerformanceQuery,
} from "@/api/admin";

export const Performance = () => {
  const { data: performanceData, isLoading } = useGetAdminPerformanceQuery();
  const { mutate: exportPerformance, isPending } =
    useExportAdminPerformanceMutation();

  const handleExport = () => {
    exportPerformance(undefined, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "performance-data.csv";

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      },
    });
  };
  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <SectionHeading
          heading="Performance Monitor"
          subheading="Track teacher effectiveness and learner progress metrics"
        />

        <div className="flex items-center gap-2 shrink-0 mt-1">
          {/* Last 30 days chip */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#047481" }}
          >
            <Calendar size={13} />
            Last 30 days
          </span>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Download size={13} />
            {isPending ? "Exporting..." : "Export Data"}
          </button>
        </div>
      </div>

      {/* Charts: 50 / 50 */}
      <div className="grid grid-cols-2 gap-4">
        <TeacherActivityCard
          weeklyActivityData={performanceData?.weeklyActivityData}
        />
        <LearnerProgressCard
          learnerProgressData={performanceData?.learnerProgressData}
        />
      </div>

      {/* Top Performing Teachers table */}
      <TopTeachersTable topTeachers={performanceData?.topTeachers || []} />
    </div>
  );
};
