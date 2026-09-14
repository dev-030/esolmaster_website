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

export const ClassHeader = ({
  classDetails,
  action,
  isTeacher,
  currentTab,
  onTabChange,
}: ClassHeaderProps) => {
  if (!classDetails) return null;

  const tabs = [
    {
      label: "Students",
      value: "students",
      icon: Users,
      count: classDetails.studentCount ?? 0,
    },
    {
      label: "Activities",
      value: "tasks",
      icon: ClipboardList,
      count: classDetails.taskCount ?? 0,
    },
    {
      label: "Settings",
      value: "settings",
      icon: Settings,
    },
  ];

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
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
          {/* Stats Pills for Student View (Teachers have counts in the tabs) */}
          {!isTeacher && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-150 px-3 py-1 text-xs font-medium text-slate-500">
                <Users className="h-3.5 w-3.5 text-[#3454FB]" />
                <strong className="text-slate-700 font-semibold">{classDetails.studentCount}</strong>{" "}
                {classDetails.studentCount === 1 ? "learner" : "learners"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-150 px-3 py-1 text-xs font-medium text-slate-500">
                <ClipboardList className="h-3.5 w-3.5 text-[#3454FB]" />
                <strong className="text-slate-700 font-semibold">{classDetails.taskCount}</strong>{" "}
                {classDetails.taskCount === 1 ? "activity" : "activities"}
              </span>
            </div>
          )}
          {action}
        </div>
      </div>

      {/* Integrated Tab Bar for Teachers */}
      {isTeacher && onTabChange && (
        <div className="border-t border-slate-100 px-4 sm:px-6 bg-white flex items-center gap-2 sm:gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.value;
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`group relative flex items-center gap-2 py-3 px-1 text-sm font-semibold transition-all duration-150 border-b-2 -mb-px cursor-pointer shrink-0 ${
                  isActive
                    ? "border-[#3454FB] text-[#3454FB]"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-[#3454FB]"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full transition-colors ${
                      isActive
                        ? "bg-blue-50 text-[#3454FB]"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
