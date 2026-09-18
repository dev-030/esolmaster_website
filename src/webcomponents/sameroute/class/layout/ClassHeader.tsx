import { ReactNode } from "react";
import { BookOpen, ClipboardList, Settings, Users } from "lucide-react";
import { ClassDetails } from "@/types/class";

interface ClassHeaderProps {
  classDetails?: ClassDetails | null;
  action?: ReactNode;
  isTeacher?: boolean;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  isLoading?: boolean;
}

export const ClassHeaderSkeleton = ({ isTeacher = true }: { isTeacher?: boolean }) => {
  return (
    <section className="rounded-[20px] border border-slate-100 bg-white overflow-hidden animate-pulse">
      {/* Top Details Row */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="h-12 w-12 shrink-0 rounded-[14px] bg-slate-100" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-md bg-slate-200/70" />
            <div className="h-3.5 w-24 rounded-md bg-slate-100" />
          </div>
        </div>
        {!isTeacher && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-24 rounded-full bg-slate-100" />
            <div className="h-7 w-24 rounded-full bg-slate-100" />
          </div>
        )}
      </div>

      {/* Teacher Tabs Skeleton */}
      {isTeacher && (
        <div className="border-t border-slate-100 px-4 sm:px-6 bg-white flex items-center gap-4 sm:gap-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-slate-200/60" />
            <div className="h-4 w-16 rounded bg-slate-200/60" />
            <div className="h-4 w-5 rounded-full bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
            <div className="h-4 w-5 rounded-full bg-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-slate-100" />
            <div className="h-4 w-14 rounded bg-slate-100" />
          </div>
        </div>
      )}
    </section>
  );
};

import { useTeacherSubscription } from "@/provider/SubscriptionProvider";

export const ClassHeader = ({
  classDetails,
  action,
  isTeacher,
  currentTab,
  onTabChange,
  isLoading,
}: ClassHeaderProps) => {
  const { limits, planType } = useTeacherSubscription();

  if (isLoading || !classDetails) {
    return <ClassHeaderSkeleton isTeacher={isTeacher} />;
  }

  const studentCount = classDetails.studentCount ?? 0;
  const taskCount = classDetails.taskCount ?? 0;
  const maxStudents = limits.maxStudentsPerClass;
  const maxTasks = limits.maxScheduledTasksInClass;
  const remainingStudents = Math.max(0, maxStudents - studentCount);
  const remainingTasks = Math.max(0, maxTasks - taskCount);

  const tabs = [
    {
      label: "Students",
      value: "students",
      icon: Users,
      count: isTeacher ? `${studentCount} / ${maxStudents}` : studentCount,
      remaining: isTeacher ? remainingStudents : undefined,
    },
    {
      label: "Activities",
      value: "tasks",
      icon: ClipboardList,
      count: isTeacher ? `${taskCount} / ${maxTasks}` : taskCount,
      remaining: isTeacher ? remainingTasks : undefined,
    },
    {
      label: "Settings",
      value: "settings",
      icon: Settings,
    },
  ];

  return (
    <section className="rounded-[20px] border border-slate-100 bg-white overflow-hidden">
      {/* Top Details Row */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-lg font-bold text-white shadow-sm"
            style={{ backgroundColor: classDetails.color || "#007EEF" }}
          >
            {classDetails.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-800">
              {classDetails.name}
            </h1>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {classDetails.subject}
            </p>
          </div>
        </div>

        {(!isTeacher || action) && (
          <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
            {!isTeacher && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <strong className="text-slate-700 font-semibold">{classDetails.studentCount}</strong>{" "}
                  {classDetails.studentCount === 1 ? "learner" : "learners"}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  <strong className="text-slate-700 font-semibold">{classDetails.taskCount}</strong>{" "}
                  {classDetails.taskCount === 1 ? "activity" : "activities"}
                </span>
              </div>
            )}
            {action}
          </div>
        )}
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
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    title={tab.remaining !== undefined ? `${tab.remaining} remaining on ${planType} plan` : undefined}
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-[11px] font-semibold rounded-full transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
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
