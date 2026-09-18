import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarTooltip } from "./BarToolTip";


interface WeeklyActivity {
  day: string;           // e.g., "Monday", "Tuesday", etc.
  tasksCreated: number;
  tasksScheduled: number;
}
export const TeacherActivityCard = ({ weeklyActivityData }: { weeklyActivityData: WeeklyActivity[] }) => (
  <Card className="rounded-2xl border border-gray-100 shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold text-gray-800">Teacher Activity</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#4F46E5" }} />
          Tasks Created
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#10B981" }} />
          Activities Assigned
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={weeklyActivityData} barCategoryGap="30%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar dataKey="tasksCreated" name="Tasks Created"   fill="#4F46E5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="tasksScheduled" name="Activities Assigned" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)
