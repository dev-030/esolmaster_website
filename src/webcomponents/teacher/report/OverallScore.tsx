"use client";

import { Pie, PieChart, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  value: { label: "Students" },
  excellent: { label: "90–100", color: "#22c55e" },
  good:      { label: "80–89",  color: "#007EEF" },
  average:   { label: "70–79",  color: "#f97316" },
  below:     { label: "Below 70", color: "#ef4444" },
} satisfies ChartConfig;

interface ScoreDataPoint {
  range: string;
  label: string;
  value: number;
  fill: string;
}

interface OverallScoreDistributionProps {
  data: ScoreDataPoint[];
}

export const OverallScoreDistribution = ({ data }: OverallScoreDistributionProps) => {
  const empty = !data || data.length === 0 || data.every((item) => item.value === 0);

  return (
    <Card className="flex flex-col rounded-xl border border-slate-200/70 shadow-none">
      <CardHeader className="px-5 py-4 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800">Overall Score Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        {empty ? (
          <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">
            No data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="range"
                  innerRadius={70}
                  outerRadius={100}
                  strokeWidth={4}
                  paddingAngle={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  formatter={(value) => {
                    const item = data.find((d) => d.range === value);
                    return (
                      <span className="text-xs font-medium text-slate-500">
                        {item?.label || value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};