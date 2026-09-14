import { Button } from "@/components/ui/button";
import { Class } from "@/types/class";
import { ArrowRight, BookOpen, ClipboardList, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";

export const ClassCard = ({
  cls,
  isTeacher,
  onEdit,
  onDelete,
  role,
}: {
  cls: Class;
  isTeacher: boolean;
  role: "teacher" | "student" | "admin";
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const destination =
    role === "teacher" ? `/classes/${cls.id}/students` : `/classes/${cls.id}/tasks`;

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-slate-100/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Top Card Banner */}
      <div
        className="relative p-5 text-white flex flex-col justify-between min-h-[110px]"
        style={{ backgroundColor: cls.color || "#3454FB" }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white">
            <BookOpen className="h-3 w-3" /> {cls.subject}
          </span>

          {isTeacher && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-white hover:bg-white/20 hover:text-white"
                onClick={onEdit}
                aria-label={`Edit ${cls.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-white hover:bg-white/20 hover:text-white"
                onClick={onDelete}
                aria-label={`Delete ${cls.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        <h3 className="truncate text-lg font-bold tracking-tight text-white mt-3">
          {cls.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium line-clamp-2 min-h-[32px]">
          {cls.description || "A classroom ready for learners, assignments, and activities."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60 py-2.5">
          <div className="px-3 text-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Users className="h-3 w-3 text-[#3454FB]" /> Learners
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-800">{cls.studentCount}</p>
          </div>
          <div className="px-3 text-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <ClipboardList className="h-3 w-3 text-[#3454FB]" /> Activities
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-800">{cls.taskCount}</p>
          </div>
        </div>

        {!isTeacher && cls.teacherName && (
          <p className="text-[11px] font-medium text-slate-400">
            Teacher: <strong className="text-slate-700 font-semibold">{cls.teacherName}</strong>
          </p>
        )}

        <Link href={destination} className="block mt-1">
          <Button
            size="sm"
            className="w-full gap-2 rounded-[12px] bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-9 shadow-sm shadow-blue-500/15 group-hover:gap-2.5 transition-all"
          >
            Open classroom <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
