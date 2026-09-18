"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";

const chartConfig = {
  completed: {
    label: "Total Completed",
    color: "#007EEF",
  },
  totalTasks: {
    label: "Total Tasks",
    color: "#007EEF33",
  },
} satisfies ChartConfig;

interface YearlyDataPoint {
  year: string;
  totalTasks: number;
  completed: number;
  totalClasses?: number;
}

interface YearlyTaskPerformanceProps {
  data: YearlyDataPoint[];
}

export const YearlyTaskPerformance = ({ data }: YearlyTaskPerformanceProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full rounded-xl border border-slate-200/70 shadow-none">
        <CardHeader className="px-5 py-4 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-800">Yearly Task Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-xl border border-slate-200/70 shadow-none">
      <CardHeader className="px-5 py-4 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800">Yearly Task Performance</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="20%"
              margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalTasks"
                stackId="a"
                fill="var(--color-totalTasks)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="completed"
                stackId="a"
                fill="var(--color-completed)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};