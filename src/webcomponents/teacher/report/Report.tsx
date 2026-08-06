'use client';
import { SectionHeading } from "@/webcomponents/reusable";
import { YearlyTaskPerformance } from "./YearlyTaskPerfomance";
import { MonthlyAssignmentCompletion } from "./MonthlyAssignMent";
import { OverallScoreDistribution } from "./OverallScore";
import { TopPerformers } from "./TopPerfomer";
import { useGetReportsOverviewQuery } from "@/api/analytics";

export const Report = () => {
  const { data: reportsOverview, isLoading } = useGetReportsOverviewQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeading
          heading="Report"
          subheading="Track performance metrics across all your classes."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!reportsOverview) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeading
          heading="Report"
          subheading="Track performance metrics across all your classes."
        />
        <div className="text-center py-12 text-muted-foreground">
          No report data available
        </div>
      </div>
    );
  }

  // Transform yearly data for chart
  const yearlyChartData = reportsOverview.yearlyTaskPerformance.flatMap((yearData: any) => {
    // If you need monthly breakdown, you might need to expand this
    // For now, we'll create a single data point per year
    return {
      year: yearData.year.toString(),
      totalTasks: yearData.totalScheduledTasks,
      completed: yearData.totalCompletedAttempts,
      totalClasses: yearData.totalClasses
    };
  });

  // Transform monthly data for chart
  const monthlyChartData = reportsOverview.monthlyTaskCompletionRate.map((month: any) => ({
    month: month.month,
    rate: month.completionRate,
    totalAssigned: month.totalAssigned,
    totalCompleted: month.totalCompleted
  }));

  // Transform score distribution data
  const scoreDistributionData = [
    {
      range: "excellent",
      label: "90–100",
      value: reportsOverview.scoreDistribution["90-100"] || 0,
      fill: "var(--color-excellent)"
    },
    {
      range: "good",
      label: "80–89",
      value: reportsOverview.scoreDistribution["80-89"] || 0,
      fill: "var(--color-good)"
    },
    {
      range: "average",
      label: "70–79",
      value: reportsOverview.scoreDistribution["70-79"] || 0,
      fill: "var(--color-average)"
    },
    {
      range: "below",
      label: "Below 70",
      value: reportsOverview.scoreDistribution["Below 70"] || 0,
      fill: "var(--color-below)"
    }
  ];

  // Transform top performers data
  const topPerformersData = reportsOverview.topPerformers.map((performer: any) => ({
    id: performer.studentId,
    name: performer.name,
    className: `Score: ${performer.avgScore}%`, // You might want to add actual class name from elsewhere
    score: performer.avgScore,
    completedTasks: performer.completedTasks,
    email: performer.email
  }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        heading="Report"
        subheading="Track performance metrics across all your classes."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YearlyTaskPerformance data={yearlyChartData} />
        <MonthlyAssignmentCompletion data={monthlyChartData} />
        <OverallScoreDistribution data={scoreDistributionData} />
        <TopPerformers data={topPerformersData} />
      </div>
    </div>
  );
};