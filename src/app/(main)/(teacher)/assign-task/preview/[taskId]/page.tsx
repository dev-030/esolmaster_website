"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTaskById } from "@/api/task/api";
import { LocalTaskPreview } from "@/webcomponents/teacher/assign-task/LocalTaskPreview";
import { toast } from "sonner";

export default function PreviewTaskPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  const [isLoading, setIsLoading] = useState(true);
  const [taskData, setTaskData] = useState<{
    title: string;
    taskType: string;
    questions: any[];
    taskSections: any[];
    taskCriteria?: any[];
    awardingBody?: string;
    entryLevel?: string;
  } | null>(null);

  useEffect(() => {
    if (params?.taskId) {
      setIsLoading(true);
      getTaskById(params.taskId)
        .then((task) => {
          let loadedSections: any[] = [];
          if (task.content) {
            try {
              const parsed = JSON.parse(task.content);
              if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
                loadedSections = parsed.sections;
              }
            } catch (e) {
              loadedSections = [
                {
                  id: "sec_1",
                  title: "Task 1",
                  instruction: "Read the text and answer the questions below.",
                  stimulusType: task.readingContent?.imageUrl ? "IMAGE" : "RICH_TEXT",
                  imageUrl: task.readingContent?.imageUrl || "",
                  content: task.content || "",
                },
              ];
            }
          }
          if (loadedSections.length === 0) {
            loadedSections = [
              {
                id: "sec_1",
                title: "Task 1",
                instruction: "Read the text and answer the questions below.",
                stimulusType: task.readingContent?.imageUrl ? "IMAGE" : "RICH_TEXT",
                imageUrl: task.readingContent?.imageUrl || "",
                content: task.content || "",
              },
            ];
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
              try {
                configObj = JSON.parse(q.config);
              } catch (e) {}

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

          let loadedCriteria: any[] = [];
          if (task.content) {
            try {
              const parsed = JSON.parse(task.content);
              if (parsed && Array.isArray(parsed.criteria)) {
                loadedCriteria = parsed.criteria;
              }
            } catch (e) {}
          }

          setTaskData({
            title: task.title || "",
            taskType: task.type || "READING",
            questions: loadedQuestions,
            taskSections: loadedSections,
            taskCriteria: loadedCriteria,
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
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium animate-pulse">Loading preview simulation...</p>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-sm font-semibold text-slate-700">Assessment not found or failed to load.</p>
        <Button variant="outline" onClick={handleExit}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Sticky Bar with Title and Exit Preview Button */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Eye className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Student Examination Preview</h2>
            <p className="text-[11px] text-slate-500">Live interactive split-screen simulation</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleExit}
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs px-3.5 h-8.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-500" />
          Exit Preview
        </Button>
      </div>

      {/* Full Screen Content Body */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
        <LocalTaskPreview
          title={taskData.title}
          taskType={taskData.taskType}
          questions={taskData.questions}
          taskSections={taskData.taskSections}
          taskCriteria={taskData.taskCriteria}
          awardingBody={taskData.awardingBody}
          entryLevel={taskData.entryLevel}
        />
      </div>
    </div>
  );
}
