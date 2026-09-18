/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  rate: {
    label: "Completion Rate (%)",
    color: "#22c55e",
  },
} satisfies ChartConfig;

interface MonthlyDataPoint {
  month: string;
  rate: number;
  totalAssigned?: number;
  totalCompleted?: number;
}

interface MonthlyAssignmentCompletionProps {
  data: MonthlyDataPoint[];
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const radius = payload.rate > 800 ? 6 : 4;
  return (
    <Dot cx={cx} cy={cy} r={radius} fill="#22c55e" stroke="#fff" strokeWidth={2} />
  );
};

export const MonthlyAssignmentCompletion = ({ data }: MonthlyAssignmentCompletionProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full rounded-xl border border-slate-200/70 shadow-none">
        <CardHeader className="px-5 py-4 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-800">Monthly Assignment Completion Rate</CardTitle>
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
        <CardTitle className="text-sm font-semibold text-slate-800">Monthly Assignment Completion Rate</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                domain={[0, "auto"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--color-rate)"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};