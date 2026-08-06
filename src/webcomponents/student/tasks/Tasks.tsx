// Tasks.tsx
"use client";
import { SectionHeading } from "@/webcomponents/reusable";
import { TASK_TYPE_CONFIG, TaskCard } from "./TaskCard";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetStudentScheduledTasksQuery } from "@/api/student";
import { EntryType, TaskType } from "@/types/task";
import { BrowseTask } from "@/types/student";

const LEVEL_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "ENTRY1", label: "Entry 1" },
  { value: "ENTRY2", label: "Entry 2" },
  { value: "ENTRY3", label: "Entry 3" },
  { value: "LEVEL1", label: "Level 1" },
  { value: "LEVEL2", label: "Level 2" },
];

export const Tasks = () => {
  const [selectedType, setSelectedType] = useState<TaskType | "">("");
  const [selectedLevel, setSelectedLevel] = useState<EntryType | "all">("all");
  const { data: scheduledTasksData } = useGetStudentScheduledTasksQuery({});

  const filtered = useMemo(() => {
    const tasks = scheduledTasksData?.data || [];

    let filteredTasks = tasks.filter((task: BrowseTask) => {
      const matchesType =
        !selectedType || task.taskType.toLowerCase() === selectedType;
      return matchesType;
    });

    if (selectedLevel !== "all") {
      filteredTasks = filteredTasks.filter((task: BrowseTask) => {
        return task.entryType?.includes(selectedLevel);
      });
    }

    return filteredTasks;
  }, [scheduledTasksData, selectedType, selectedLevel]);

  const grammarTasks = filtered.filter(
    (t) => t.taskType.toLowerCase() === "grammar",
  );
  const readingTasks = filtered.filter(
    (t) => t.taskType.toLowerCase() === "reading",
  );
  const vocabularyTasks = filtered.filter(
    (t) => t.taskType.toLowerCase() === "vocabulary",
  );

  const hasActiveFilter = selectedType !== "" || selectedLevel !== "all";

  return (
    <div className="flex flex-col gap-6 lg:px-6 md:px-4 max-md:px-2">
      <SectionHeading
        heading="Browse Tasks"
        subheading="Here are the tasks assigned to you."
      />

      <Card className="border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </div>

            <div className="flex gap-2 flex-wrap flex-1">
              {(Object.keys(TASK_TYPE_CONFIG) as TaskType[]).map((type) => {
                const cfg = TASK_TYPE_CONFIG[type];
                const isActive = selectedType === type;
                const Icon = cfg.icon;

                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(isActive ? "" : type)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-all",
                      isActive
                        ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                        : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                    {isActive && <X className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Select
                value={selectedLevel}
                onValueChange={(value) => setSelectedLevel(value ?? "all")}
              >
                <SelectTrigger className="h-8 text-xs w-36 gap-1.5">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilter && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedType("");
                  setSelectedLevel("all");
                }}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-2xl">
            📚
          </div>
          <p className="font-semibold text-foreground">No tasks found</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Try adjusting your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedType("");
              setSelectedLevel("all");
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grammarTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-lg font-semibold">Grammar</h2>
                <span className="text-sm text-muted-foreground">
                  ({grammarTasks.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {grammarTasks.map((task) => (
                  <TaskCard key={task.scheduledTaskId} task={task} />
                ))}
              </div>
            </div>
          )}

          {readingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-lg font-semibold">Reading</h2>
                <span className="text-sm text-muted-foreground">
                  ({readingTasks.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {readingTasks.map((task) => (
                  <TaskCard key={task.scheduledTaskId} task={task} />
                ))}
              </div>
            </div>
          )}

          {vocabularyTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                <h2 className="text-lg font-semibold">Vocabulary</h2>
                <span className="text-sm text-muted-foreground">
                  ({vocabularyTasks.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {vocabularyTasks.map((task) => (
                  <TaskCard key={task.scheduledTaskId} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
