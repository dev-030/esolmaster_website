"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Gauge, Loader2, Users } from "lucide-react";
import { useGetScheduledTaskAnalyticsQuery } from "@/api/class";
import { Card } from "@/components/ui/card";

const STATUS_STYLES = {
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  NOT_STARTED: "bg-slate-100 text-slate-600 ring-slate-200",
  OVERDUE: "bg-red-50 text-red-700 ring-red-200",
};

const STATUS_LABELS = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In progress",
  NOT_STARTED: "Not started",
  OVERDUE: "Overdue",
};

export const TeacherTaskResults = () => {
  const { classId, taskId } = useParams<{ classId: string; taskId: string }>();
  const { data, isLoading } = useGetScheduledTaskAnalyticsQuery(classId, taskId);

  if (isLoading || !data) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-5">
      <Link href={`/classes/${classId}/tasks`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" /> Back to activities
      </Link>

      <div>
        <span className="mb-1.5 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">{data.task.type.toLowerCase()}</span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">{data.task.title}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <Clock3 className="h-4 w-4" />
          {data.dueAt ? `Due ${new Date(data.dueAt).toLocaleString()}` : "No due date"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="gap-2 border-blue-100 p-4 py-4 shadow-none">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Completed</span><Users className="h-4 w-4 text-blue-500" /></div>
          <p className="text-2xl font-bold text-slate-950">{data.completedStudents}<span className="text-base font-medium text-slate-400"> / {data.totalStudents}</span></p>
          <p className="text-xs text-slate-500">{data.completionRate}% submission rate</p>
        </Card>
        <Card className="gap-2 border-blue-100 p-4 py-4 shadow-none">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Average score</span><Gauge className="h-4 w-4 text-blue-500" /></div>
          <p className="text-2xl font-bold text-slate-950">{data.averagePercentage}%</p>
          <p className="text-xs text-slate-500">Across completed submissions</p>
        </Card>
        <Card className="gap-2 border-blue-100 p-4 py-4 shadow-none">
          <div className="flex items-center justify-between text-sm font-medium text-slate-500"><span>Available marks</span><CheckCircle2 className="h-4 w-4 text-blue-500" /></div>
          <p className="text-2xl font-bold text-slate-950">{data.totalMarks}</p>
          <p className="text-xs text-slate-500">Total marks per student</p>
        </Card>
      </div>

      <Card className="gap-0 py-0 shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3.5">
          <h2 className="font-semibold text-slate-900">Student submissions</h2>
          <p className="mt-0.5 text-xs text-slate-500">Live status and marks for everyone enrolled in this class.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Marks</th>
                <th className="px-4 py-3 font-semibold">Score</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{student.name || "Unnamed student"}</div>
                    <div className="text-xs text-slate-500">{student.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[student.status]}`}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-900">{student.score === null ? "—" : `${student.score} / ${data.totalMarks}`}</td>
                  <td className="px-4 py-3.5">
                    {student.percentage === null ? "—" : (
                      <span className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{student.percentage}%</span>
                        <span className={`text-xs font-semibold ${student.isPassed ? "text-emerald-600" : "text-red-600"}`}>{student.isPassed ? "Pass" : "Fail"}</span>
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 text-slate-500 md:table-cell">{student.completedAt ? new Date(student.completedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.students.length && <p className="py-12 text-center text-sm text-slate-500">No students are enrolled in this class.</p>}
        </div>
      </Card>
    </div>
  );
};
