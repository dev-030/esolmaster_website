"use client";

import { Class } from "@/types/class";
import { ArrowRight, BookOpen, ClipboardList, Copy, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  onDelete?: () => void;
}) => {
  const destination =
    role === "teacher" ? `/classes/${cls.id}/students` : `/classes/${cls.id}/tasks`;

  const cardColor = cls.color || "#007EEF";

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cls.joinCode) {
      navigator.clipboard.writeText(cls.joinCode);
      toast.success("Class code copied to clipboard!");
    }
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5 w-full shadow-none">
      {/* Top Card Banner */}
      <div
        className="relative overflow-hidden p-4 sm:p-5 text-white flex flex-col justify-between min-h-[104px] transition-all"
        style={{
          backgroundColor: cardColor,
        }}
      >
        {/* Subtle decorative watermark */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none blur-sm" />
        <BookOpen className="absolute -right-2 -bottom-2 w-16 h-16 text-white/10 pointer-events-none stroke-[1.2] rotate-12" />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white tracking-wide border border-white/20 shadow-none">
            <BookOpen className="h-3 w-3" />
            {cls.subject}
          </span>

          <div className="flex items-center gap-1">
            {cls.joinCode && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono font-medium text-white/90 hover:text-white border border-white/15 transition-all cursor-pointer"
                title="Click to copy class code"
              >
                <span>{cls.joinCode}</span>
                <Copy className="h-2.5 w-2.5 opacity-75" />
              </button>
            )}

            {isTeacher && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                className="h-7 w-7 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-xs border border-white/10 cursor-pointer"
                aria-label={`Edit ${cls.name}`}
                title="Edit class"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="relative z-10 truncate text-base sm:text-lg font-bold tracking-tight text-white mt-3 leading-snug">
          {cls.name}
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-4.5 flex flex-col flex-1 justify-between gap-3.5">
        {cls.description?.trim() ? (
          <p className="text-xs text-slate-500 font-normal line-clamp-2 leading-relaxed">
            {cls.description}
          </p>
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 transition-colors"
            style={{ backgroundColor: `${cardColor}08` }}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${cardColor}15`, color: cardColor }}
            >
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                {cls.studentCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                Learners
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 transition-colors"
            style={{ backgroundColor: `${cardColor}08` }}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${cardColor}15`, color: cardColor }}
            >
              <ClipboardList className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                {cls.taskCount ?? 0}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                Activities
              </p>
            </div>
          </div>
        </div>

        {!isTeacher && cls.teacherName && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="text-slate-400">Teacher:</span>
            <span className="font-semibold text-slate-700 truncate">
              {cls.teacherName}
            </span>
          </div>
        )}

        <Link href={destination} className="block mt-0.5">
          <button
            type="button"
            className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-xs h-9 px-4 shadow-none border-none transition-all duration-150 hover:brightness-95 active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: cardColor,
              boxShadow: "none",
            }}
          >
            <span>Open classroom</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </Link>
      </div>
    </div>
  );
};
