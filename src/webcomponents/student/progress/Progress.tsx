'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  TooltipProps,
} from "recharts";
import { ProgressCard } from "./ProgressCard";
import {
  useGetStudentProgressQuery,
  useGetStudentScoreTrendQuery,
  useGetStudentSkillDistributionQuery,
} from "@/api/student";

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomLineTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-xs">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-1.5 py-0.5" style={{ color: entry.color }}>
            <span className="font-medium text-slate-600">{entry.name}:</span>
            <span className="font-bold text-slate-800">{entry.value}%</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-xs">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-500 mt-0.5">
          Proficiency: <strong className="text-slate-800 font-bold">{payload[0].value}%</strong>
        </p>
      </div>
    );
  }
  return null;
};

export const Progress = () => {
  const { data: studentProgress } = useGetStudentProgressQuery();
  const { data: score } = useGetStudentScoreTrendQuery();
  const { data: skillDistribution } = useGetStudentSkillDistributionQuery();

  const PROGRESS_CARDS = [
    {
      title: "Grammar Mastery",
      value: studentProgress?.grammar || 0,
      label: "Grammar",
      color: "#3454FB",
    },
    {
      title: "Reading Comprehension",
      value: studentProgress?.reading || 0,
      label: "Reading",
      color: "#10B981",
    },
    {
      title: "Vocabulary",
      value: studentProgress?.vocabulary || 0,
      label: "Vocabulary",
      color: "#F59E0B",
    },
    {
      title: "Overall Progress",
      value: studentProgress?.overall || 0,
      label: "Overall",
      color: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Progress Tracker
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Monitor your learning performance and mastery across all core competencies
        </p>
      </div>

      {/* 4 progress cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROGRESS_CARDS.map((card, index) => (
          <ProgressCard key={index} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              Score Trend
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Performance analysis over recent activity attempts
            </p>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={score} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="Grammar"
                stroke="#3454FB"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#3454FB" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Reading"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#10B981" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Vocabulary"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#F59E0B" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Distribution Donut */}
        <div className="rounded-[22px] border border-slate-100/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              Skill Distribution
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Current breakdown of total skills mastered
            </p>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {(skillDistribution ?? []).map((entry: { name: string; color: string }, index: number) => (
                  <Cell
                    key={entry.name ?? index}
                    fill={entry.color || "#3454FB"}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
                iconType="circle"
                iconSize={8}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};