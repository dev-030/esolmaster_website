"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  FileCheck2,
  Loader2,
  Lock,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTaskById } from "@/api/task/api";
import { LocalTaskPreview } from "@/webcomponents/teacher/assign-task/LocalTaskPreview";
import { TaskOverviewAnswerKey } from "@/webcomponents/teacher/assign-task/TaskOverviewAnswerKey";
import { AssignToClassDialog } from "@/webcomponents/teacher/assign-task/AssignToClassDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PreviewTaskPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "overview">("preview");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [taskData, setTaskData] = useState<{
    title: string;
    taskType: string;
    questions: any[];
    taskSections: any[];
    taskCriteria?: any[];
    passMark?: number | null;
    passLogic?: string;
    awardingBody?: string;
    entryLevel?: string;
  } | null>(null);

  useEffect(() => {
    if (params?.taskId) {
      setIsLoading(true);
      getTaskById(params.taskId)
        .then((task) => {
          let loadedSections: any[] = [];
          let loadedCriteria: any[] = [];
          let parsedContent: any = null;

          if (typeof task.content === "string") {
            try {
              parsedContent = JSON.parse(task.content);
            } catch (e) {}
          } else if (typeof task.content === "object" && task.content !== null) {
            parsedContent = task.content;
          }

          if (parsedContent && Array.isArray(parsedContent.sections) && parsedContent.sections.length > 0) {
            loadedSections = parsedContent.sections;
          } else {
            loadedSections = [
              {
                id: "sec_1",
                title: "Task 1",
                instruction: "Read the text and answer the questions below.",
                stimulusType: task.readingContent?.imageUrl ? "IMAGE" : "RICH_TEXT",
                imageUrl: task.readingContent?.imageUrl || "",
                content: typeof task.content === "string" ? task.content : "",
              },
            ];
          }

          if (parsedContent && Array.isArray(parsedContent.criteria)) {
            loadedCriteria = parsedContent.criteria;
          }

          let loadedQuestions: any[] = [];
          if (task.questions) {
            loadedQuestions = task.questions.map((q: any) => {
              let configObj = {
                question: "",
                prompt: "",
                explanation: "",
                marks: 1,
                data: undefined,
                sectionId: undefined,
              } as any;

              if (typeof q.config === "string") {
                try {
                  configObj = JSON.parse(q.config);
                } catch (e) {}
              } else if (typeof q.config === "object" && q.config !== null) {
                configObj = q.config;
              }

              const { question, prompt, explanation, marks, data, sectionId, ...restConfig } =
                configObj;
              const contentStr = question || prompt || "";
              let extractedConfig = data || restConfig || {};

              if (q.type === "TRUE_FALSE" && !extractedConfig.options) {
                extractedConfig.options = ["True", "False"];
                extractedConfig.correctIndex = extractedConfig.correctAnswer === "TRUE" ? 0 : 1;
              }

              if (q.type === "MATCHING" && extractedConfig.pairs && !extractedConfig.leftItems) {
                extractedConfig.leftItems = extractedConfig.pairs.map((p: any) => p?.left || "");
                extractedConfig.rightItems = extractedConfig.pairs.map((p: any) => p?.right || "");
                extractedConfig.matches = extractedConfig.pairs.reduce((acc: any, p: any, i: number) => {
                  acc[i] = i;
                  return acc;
                }, {});
              }

              if (extractedConfig.options && Array.isArray(extractedConfig.options)) {
                if (extractedConfig.correctIndex === undefined) {
                  const legacyIdx = extractedConfig.options.findIndex(
                    (o: any) => o && typeof o === "object" && o.isCorrect,
                  );
                  if (legacyIdx !== -1) extractedConfig.correctIndex = legacyIdx;
                }
                extractedConfig.options = extractedConfig.options.map((opt: any) =>
                  typeof opt === "string" ? opt : opt?.text || "",
                );
              }
              if (extractedConfig.items && Array.isArray(extractedConfig.items)) {
                extractedConfig.items = extractedConfig.items.map((opt: any) =>
                  typeof opt === "string" ? opt : opt?.text || "",
                );
              }

              return {
                id: q.id,
                sectionId: sectionId || loadedSections[0]?.id || "sec_1",
                type: q.type,
                content: contentStr,
                explanation: explanation || "",
                criterionId: q.criterionId || undefined,
                marks: marks ?? 1,
                config: extractedConfig,
              };
            });
          }

          setTaskData({
            title: task.title || "",
            taskType: task.type || "READING",
            questions: loadedQuestions,
            taskSections: loadedSections,
            taskCriteria: loadedCriteria,
            passMark: task.passMark ?? null,
            passLogic: task.readingContent?.passLogic || task.passLogic || undefined,
            awardingBody: task.readingContent?.awardingBody || undefined,
            entryLevel: task.readingContent?.entryType?.[0] || undefined,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          toast.error("Failed to load task for preview");
          setIsLoading(false);
        });
    }
  }, [params?.taskId]);

  const handleExit = () => {
    if (folderId) {
      router.push(`/content-library?folderId=${folderId}`);
    } else {
      router.back();
    }
  };

  if (!params?.taskId) {
    return <div>Invalid task ID</div>;
  }

  if (isLoading) {
    return (
      <div className="-m-4 sm:-m-6 min-h-[calc(100%+2rem)] sm:min-h-[calc(100%+3rem)] flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium animate-pulse">Loading activity preview...</p>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="-m-4 sm:-m-6 min-h-[calc(100%+2rem)] sm:min-h-[calc(100%+3rem)] flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-sm font-semibold text-slate-700">Assessment not found or failed to load.</p>
        <Button variant="outline" onClick={handleExit}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="-m-4 sm:-m-6 min-h-[calc(100%+2rem)] sm:min-h-[calc(100%+3rem)] bg-slate-50 flex flex-col overflow-x-hidden">
      {/* Top Sticky Bar with Title, View Switcher, Assign and Exit Buttons */}
      <div className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-xs">
        {/* Left: Title & Meta */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-bold text-slate-900 truncate leading-tight max-w-[280px] sm:max-w-md">
                {taskData.title}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 shrink-0">
                <Lock className="w-2.5 h-2.5" /> Read-Only
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {taskData.awardingBody ? `${taskData.awardingBody} · ` : ""}
              {taskData.entryLevel ? taskData.entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ") : "General Activity"}
            </p>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeTab === "preview"
                  ? "bg-white text-[#3454FB] shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Student Simulation</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-white text-[#3454FB] shadow-xs"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Overview & Answer Key</span>
            </button>
          </div>
        </div>

        {/* Right: Assign to Class & Exit Preview */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => setIsAssignOpen(true)}
            className="bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs px-3.5 h-8.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            Assign to Class
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleExit}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs px-3 h-8.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content Body */}
      {activeTab === "preview" ? (
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <LocalTaskPreview
            title={taskData.title}
            taskType={taskData.taskType}
            questions={taskData.questions}
            taskSections={taskData.taskSections}
            taskCriteria={taskData.taskCriteria}
            passMark={taskData.passMark}
            passLogic={taskData.passLogic}
            awardingBody={taskData.awardingBody}
            entryLevel={taskData.entryLevel}
          />
        </div>
      ) : (
        <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
          <TaskOverviewAnswerKey taskData={taskData} />
        </div>
      )}

      {/* Assign to Class Modal */}
      {taskData && (
        <AssignToClassDialog
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          taskId={params.taskId}
          taskTitle={taskData.title}
        />
      )}
    </div>
  );
}

