import { ReactNode } from "react";
import { BookOpen, ClipboardList, Users } from "lucide-react";
import { ClassDetails } from "@/types/class";

export const ClassHeader = ({
  classDetails,
  action,
}: {
  classDetails: ClassDetails;
  action?: ReactNode;
}) => {
  if (!classDetails) return null;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm"
          style={{ backgroundColor: classDetails.color }}
        >
          {classDetails.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{classDetails.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            <BookOpen className="h-3.5 w-3.5" /> {classDetails.subject}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex divide-x rounded-lg border border-slate-100 bg-slate-50 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600">
            <Users className="h-4 w-4 text-slate-400" />
            <strong className="text-slate-900">{classDetails.studentCount}</strong> learners
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <strong className="text-slate-900">{classDetails.taskCount}</strong> activities
          </div>
        </div>
        {action}
      </div>
    </section>
  );
};
