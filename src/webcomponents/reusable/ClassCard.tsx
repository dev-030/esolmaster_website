import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="group overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative min-h-30 p-5 text-white" style={{ backgroundColor: cls.color }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
              <BookOpen className="h-3.5 w-3.5" /> {cls.subject}
            </div>
            <h3 className="truncate text-xl font-bold tracking-tight">{cls.name}</h3>
          </div>
          {isTeacher && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
                onClick={onEdit}
                aria-label={`Edit ${cls.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/15 hover:text-white"
                onClick={onDelete}
                aria-label={`Delete ${cls.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="space-y-5 p-5">
        <p className="min-h-10 text-sm leading-5 text-slate-600 line-clamp-2">
          {cls.description || "A classroom ready for learners and activities."}
        </p>

        <div className="grid grid-cols-2 divide-x rounded-xl border border-slate-100 bg-slate-50/70">
          <div className="px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Users className="h-3.5 w-3.5" /> Learners
            </span>
            <p className="mt-1 text-lg font-bold text-slate-900">{cls.studentCount}</p>
          </div>
          <div className="px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <ClipboardList className="h-3.5 w-3.5" /> Activities
            </span>
            <p className="mt-1 text-lg font-bold text-slate-900">{cls.taskCount}</p>
          </div>
        </div>

        {!isTeacher && cls.teacherName && (
          <p className="text-xs text-slate-500">Taught by {cls.teacherName}</p>
        )}

        <Link href={destination} className="block">
          <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 font-semibold">
            Open classroom <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
