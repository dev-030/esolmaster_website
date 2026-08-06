"use client";

import { useState } from "react";
import { SectionHeading } from "@/webcomponents/reusable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExportAdminReportMutation } from "@/api/admin";

// ─── Real report definitions (each backed by a live CSV export endpoint) ────

interface ReportDef {
  type: string;
  title: string;
  description: string;
}

const REPORTS: ReportDef[] = [
  {
    type: "user_activity",
    title: "User Activity Report",
    description: "Every registered user — role, status, and join date.",
  },
  {
    type: "teacher_performance",
    title: "Teacher Performance Summary",
    description: "Students, tasks created, and average score per teacher.",
  },
  {
    type: "learner_progress",
    title: "Learner Progress & Completion Stats",
    description: "Average learner score by month.",
  },
  {
    type: "task_log",
    title: "Task Submission & Approval Log",
    description: "Every task — type, status, creator, and creation date.",
  },
  {
    type: "platform_engagement",
    title: "Platform Engagement Overview",
    description: "30-day active-user metrics and daily engagement.",
  },
  {
    type: "revenue_subscriptions",
    title: "Revenue & Subscription Analytics",
    description: "Every subscription — plan, billing status, and price.",
  },
];

// ─── Child: Report Row ────────────────────────────────────────────────────────

const ReportRow = ({
  report,
  onDownload,
  isDownloading,
}: {
  report: ReportDef;
  onDownload: (type: string) => void;
  isDownloading: boolean;
}) => (
  <div className="flex items-center justify-between py-4 gap-4">
    {/* Left */}
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-800">
        {report.title}
      </span>
      <span className="text-xs text-gray-400">{report.description}</span>
    </div>

    {/* Right */}
    <button
      onClick={() => onDownload(report.type)}
      disabled={isDownloading}
      className="flex items-center gap-1.5 shrink-0 text-primary hover:text-primary/80 text-xs font-medium disabled:opacity-50"
    >
      {isDownloading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      Download CSV
    </button>
  </div>
);

// ─── Main: Report ─────────────────────────────────────────────────────────────

export const Report = () => {
  const { mutate: exportReport } = useExportAdminReportMutation();
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleDownload = (type: string) => {
    setDownloadingType(type);
    exportReport(type, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setDownloadingType(null);
      },
      onError: () => {
        toast.error("Failed to generate report");
        setDownloadingType(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading heading="Reports" />

      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <FileText size={18} className="text-gray-400" />
          <CardTitle className="text-base font-semibold text-gray-800">
            Available Reports
          </CardTitle>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {REPORTS.map((report, idx) => (
            <div key={report.type}>
              <div className="px-6">
                <ReportRow
                  report={report}
                  onDownload={handleDownload}
                  isDownloading={downloadingType === report.type}
                />
              </div>
              {idx < REPORTS.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
