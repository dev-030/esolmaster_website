import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AreaTooltip } from "./AreaToolTip";


interface LearnerProgress {
  month: string;   // e.g., "Jan", "Feb", etc.
  score: number;   // average score for that month (0-100)
}
export const LearnerProgressCard = ({ learnerProgressData }: { learnerProgressData: LearnerProgress[] }) => (
  <Card className="rounded-2xl border border-gray-100 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold text-gray-800">Learner Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={268}>
        <AreaChart data={learnerProgressData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="primaryArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB4D" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={32}
            domain={[40, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<AreaTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#primaryArea)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--primary))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)
