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
    <div className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5 w-full max-w-[310px]">
      {/* Top Card Banner */}
      <div
        className="relative p-4 sm:p-4.5 text-white flex flex-col justify-between min-h-[96px]"
        style={{ backgroundColor: cls.color || "#3454FB" }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-semibold text-white">
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

        <h3 className="truncate text-base font-bold tracking-tight text-white mt-2.5">
          {cls.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-4.5 flex flex-col flex-1 justify-between gap-3.5">
        {cls.description?.trim() ? (
          <p className="text-xs text-slate-500 font-medium line-clamp-2">
            {cls.description}
          </p>
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50 py-2">
          <div className="px-2 text-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <Users className="h-3 w-3 text-[#3454FB]" /> Learners
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-800">{cls.studentCount}</p>
          </div>
          <div className="px-2 text-center">
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

        <Link href={destination} className="block mt-0.5">
          <Button
            size="sm"
            className="w-full gap-2 rounded-[12px] bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-8.5 shadow-none group-hover:gap-2.5 transition-all"
          >
            Open classroom <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
