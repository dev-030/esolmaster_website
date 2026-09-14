import { ReactNode } from "react";
import { BookOpen, ClipboardList, Settings, Users } from "lucide-react";
import { ClassDetails } from "@/types/class";

interface ClassHeaderProps {
  classDetails: ClassDetails;
  action?: ReactNode;
  isTeacher?: boolean;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

const TABS = [
  { label: "Students", value: "students", icon: Users },
  { label: "Activities", value: "tasks", icon: ClipboardList },
  { label: "Settings", value: "settings", icon: Settings },
];

export const ClassHeader = ({
  classDetails,
  action,
  isTeacher,
  currentTab,
  onTabChange,
}: ClassHeaderProps) => {
  if (!classDetails) return null;

  return (
    <section className="rounded-[20px] border border-slate-100/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Top Details Row */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-lg font-bold text-white shadow-sm"
            style={{ backgroundColor: classDetails.color || "#3454FB" }}
          >
            {classDetails.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-800">
              {classDetails.name}
            </h1>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
              <BookOpen className="h-3.5 w-3.5 text-[#3454FB]" />
              {classDetails.subject}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {/* Stats Pills */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              <Users className="h-3.5 w-3.5 text-[#3454FB]" />
              <strong className="text-slate-700 font-bold">{classDetails.studentCount}</strong>{" "}
              {classDetails.studentCount === 1 ? "learner" : "learners"}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              <ClipboardList className="h-3.5 w-3.5 text-[#3454FB]" />
              <strong className="text-slate-700 font-bold">{classDetails.taskCount}</strong>{" "}
              {classDetails.taskCount === 1 ? "activity" : "activities"}
            </span>
          </div>
          {action}
        </div>
      </div>

      {/* Integrated Tab Bar for Teachers */}
      {isTeacher && onTabChange && (
        <div className="border-t border-slate-100 px-6 bg-white flex items-center gap-6">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`relative flex items-center gap-2 py-3.5 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px ${
                  isActive
                    ? "border-[#3454FB] text-[#3454FB] font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-[#3454FB]" : "text-slate-400"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
