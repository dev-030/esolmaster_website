/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, School, Trophy, CheckCircle2, AlertCircle, BookOpen, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGetStudentsAnalyticsQuery } from "@/api/analytics";

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusColor(status: string) {
  switch (status) {
    case "GOOD":
      return "bg-emerald-50 text-emerald-700";
    case "NORMAL":
      return "bg-blue-50 text-blue-700";
    case "PROBLEMATIC":
      return "bg-red-50 text-red-700";
    case "AVERAGE":
      return "bg-yellow-50 text-yellow-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "GOOD":
      return "Good Progress";
    case "NORMAL":
      return "Normal";
    case "PROBLEMATIC":
      return "At Risk";
    case "AVERAGE":
      return "Average";
    default:
      return status;
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  title,
  value,
  colorClass,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  colorClass: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colorClass)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wide", colorClass.replace(/bg-\S+/, "").trim())}>
            {title}
          </p>
          <p className={cn("text-2xl font-bold mt-0.5 leading-none", colorClass.replace(/bg-\S+/, "").trim())}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-lg shadow-md px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-muted-foreground capitalize">{p.name}:</span>
            <span className="font-bold text-foreground">{p.value}%</span>
            {p.payload.completedTasks && (
              <span className="text-muted-foreground text-[10px]">
                ({p.payload.completedTasks} tasks)
              </span>
            )}
          </div>
        ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export const StudentInfo = () => {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();

  const { data: response, isLoading, error } = useGetStudentsAnalyticsQuery(params.studentId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-1">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              Loading student information...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !response) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-1">
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-muted-foreground">Failed to load student information.</p>
              <Button variant="outline" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Go back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, summary, lastThreeMonthsPerformance, lifetimeSkillBreakdown } = response;

  // Prepare chart data from lastThreeMonthsPerformance
  const chartData = lastThreeMonthsPerformance 
    ? lastThreeMonthsPerformance.reading.map((readingItem: any, index: number) => ({
        month: readingItem.month,
        reading: readingItem.avgScore,
        vocabulary: lastThreeMonthsPerformance.vocabulary[index]?.avgScore || 0,
        grammar: lastThreeMonthsPerformance.grammar[index]?.avgScore || 0,
        readingTasks: readingItem.completedTasks,
        vocabularyTasks: lastThreeMonthsPerformance.vocabulary[index]?.completedTasks || 0,
        grammarTasks: lastThreeMonthsPerformance.grammar[index]?.completedTasks || 0,
      }))
    : [];

  // Calculate total tasks stats
  const totalTasks = summary.totalScheduledTasks;
  const completedRate = totalTasks > 0 
    ? Math.round((summary.completedTasks / totalTasks) * 100) 
    : 0;

  // Prepare skill breakdown from lifetimeSkillBreakdown
  const skillBreakdown = {
    reading: lifetimeSkillBreakdown?.find((s: any) => s.criterionCode?.startsWith('R'))?.percentage || 0,
    vocabulary: lifetimeSkillBreakdown?.find((s: any) => s.criterionCode?.startsWith('V'))?.percentage || 0,
    grammar: lifetimeSkillBreakdown?.find((s: any) => s.criterionCode?.startsWith('G'))?.percentage || 0,
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Back to Students
      </Button>

      {/* ── Profile card ── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16 rounded-full shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold rounded-full">
                {initials(student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-foreground leading-tight">
                    {student.name}
                  </h1>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {student.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <School className="w-3.5 h-3.5 shrink-0" />
                      {student.connectedClasses.length} Class{student.connectedClasses.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border",
                  getStatusColor(summary.status)
                )}>
                  {getStatusLabel(summary.status)}
                </div>
              </div>
              
              {/* Connected Classes List */}
              {student.connectedClasses.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Enrolled Classes:</p>
                  <div className="flex flex-wrap gap-2">
                    {student.connectedClasses.map((classItem: any) => (
                      <span key={classItem.id} className="text-xs bg-muted/50 px-2 py-1 rounded-md">
                        {classItem.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Trophy}
          title="Avg Score"
          value={`${Math.round(summary.avgScore)}%`}
          colorClass="bg-muted/60 text-muted-foreground"
          subtitle={`Completed: ${summary.completedTasks}/${totalTasks} tasks`}
        />
        <StatCard
          icon={CheckCircle2}
          title="Progress"
          value={`${summary.progressPercentage}%`}
          colorClass="bg-emerald-50 text-emerald-700"
          subtitle={`${completedRate}% completion rate`}
        />
        <StatCard
          icon={AlertCircle}
          title="Task Status"
          value={summary.inProgressTasks}
          colorClass="bg-blue-50 text-blue-600"
          subtitle={`${summary.notStartedTasks} not started`}
        />
      </div>

      {/* ── Performance + Skills ── */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Performance History — 75% */}
        <div className="lg:w-3/4">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Last 3 Months Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    barGap={3}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={6}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                    <Legend
                      iconType="circle"
                      iconSize={7}
                      wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                    />
                    <Bar dataKey="grammar" name="Grammar" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="vocabulary" name="Vocabulary" fill="hsl(var(--primary) / 0.65)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="reading" name="Reading" fill="hsl(var(--primary) / 0.35)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No performance data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Breakdown — 25% */}
        <div className="lg:w-1/4">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Skill Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              {/* Grammar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Grammar</span>
                  <span className="font-bold text-primary">{Math.round(skillBreakdown.grammar)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${Math.min(100, skillBreakdown.grammar)}%` }}
                  />
                </div>
              </div>

              {/* Reading */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600">Reading</span>
                  <span className="font-bold text-emerald-600">{Math.round(skillBreakdown.reading)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, skillBreakdown.reading)}%` }}
                  />
                </div>
              </div>

              {/* Vocabulary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-orange-500">Vocabulary</span>
                  <span className="font-bold text-orange-500">{Math.round(skillBreakdown.vocabulary)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, skillBreakdown.vocabulary)}%` }}
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-3 border-t space-y-2">
                <div>
                  <p className="text-[11px] text-muted-foreground">Total Scheduled Tasks</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{summary.totalScheduledTasks}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Last Activity</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    {summary.lastAttemptAt ? new Date(summary.lastAttemptAt).toLocaleDateString() : 'No activity yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};