// src/webcomponents/layouts/TaskTypeLayOutClient.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useGetTaskByIdQuery, useUpdateTaskMutation } from "@/api/task";
import { ReadingPassage } from "@/webcomponents/teacher/assign-task/reading/ReadingPassage";
import {
  GrammarLearning,
  GrammarLearningData,
} from "@/webcomponents/teacher/assign-task/grammar/GrammarLearning";
import { VocabularyWord } from "@/webcomponents/teacher/assign-task/vocubulary/VocubularyWord";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const TASK_MAP = {
  grammar: ["mcq", "gap-fill", "question-answer","word-box-match"],
  reading: ["mcq", "gap-fill", "question-answer", "ordering"],
  vocabulary: ["mcq", "gap-fill", "matching", "word-spelling"],
};

const EMPTY_READING_CONTENT = {
  title: "",
  passage: "",
  imageUrl: "",
  imageFile: undefined,
  awardingBody: undefined,
  passMark: undefined,
  entry: { entryTypes: [] },
};

const EMPTY_GRAMMAR = {
  title: "",
  explanation: "",
  entry: { entryTypes: [] },
};
export default function TaskTypeClientLayout({
  children,
  initialTask,
}: {
  children: React.ReactNode;
  initialTask: any;
}) {
  const { taskId, taskType } = useParams();
  const pathname = usePathname();

  const tabs = TASK_MAP[taskType as keyof typeof TASK_MAP] || [];

  const { data: taskData, isLoading } = useGetTaskByIdQuery(taskId as string);

  const ginfo = taskData?.grammarContent
    ? {
        title: taskData.title,
        explanation: taskData.grammarContent.content,
        entry: { entryTypes: taskData.grammarContent.entryType || [] },
      }
    : EMPTY_GRAMMAR;

  const [grammarInfo, setGrammarInfo] = useState<GrammarLearningData>(ginfo);
  const task = taskData || initialTask;

  const { mutateAsync: updateTask, isPending } = useUpdateTaskMutation(
    taskId as string,
  );

  const handleGrammarSaveOnParent = (data: GrammarLearningData) => {
    setGrammarInfo(data);
  };

  const handleReadingSave = async (data: any) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.passage);
    if (data.imageFile) {
      formData.append("passageImage", data.imageFile);
    }
    if (data.awardingBody) {
      formData.append("awardingBody", data.awardingBody);
    }
    if (data.passMark !== undefined) {
      formData.append("passMark", String(data.passMark));
    }
    const entryTypes = data.entry?.entryTypes || [];
    if (entryTypes.length > 0) {
      entryTypes.forEach((et: string) => formData.append("entryType[]", et));
    }

    try {
      await updateTask({ payload: formData });
      toast.success("Reading passage updated!");
    } catch (error) {
      toast.error("Failed to update reading passage.");
    }
  };

  const handleGrammarSave = async () => {
    console.log("Saving grammar content with data:", grammarInfo);
    const formData = new FormData();
    formData.append("title", grammarInfo.title);
    formData.append("content", grammarInfo.explanation);
    const entryTypes = grammarInfo.entry?.entryTypes || [];
    if (entryTypes.length > 0) {
      entryTypes.forEach((et: string) => formData.append("entryType[]", et));
    }
    console.log(
      formData.get("content"),
      formData.getAll("entryType[]"),
      "FormData prepared for submission",
    );

    try {
      await updateTask({ payload: formData });
      toast.success("Grammar content updated!");
    } catch (error) {
      toast.error("Failed to update grammar content.");
    }
  };

  const handleVocabularySave = async (data: any) => {
    const formData = new FormData();
    const updateWords = [
      {
        id: data.id,
        wordName: data.word,
        definition: data.definition,
      },
    ];

    formData.append("updateWords", JSON.stringify(updateWords));
    if (data.imageFile) {
      formData.append("images", data.imageFile);
    }

    try {
      await updateTask({payload: formData});
      toast.success("Vocabulary word updated!");
    } catch (error) {
      toast.error("Failed to update vocabulary word.");
    }
  };

  if (isLoading && !initialTask) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="py-8 flex flex-col gap-6  w-full">
      {/* ── Dynamic Top Content ── */}
      <div>
        {taskType === "reading" && (
          <ReadingPassage
            mode="disabled"
            initialData={
              task?.readingContent
                ? {
                    title: task.title,
                    passage: task.readingContent.content,
                    imageUrl: task.readingContent.imageUrl,
                    awardingBody: task.readingContent.awardingBody,
                    passMark: task.readingContent.passMark,
                    entry: { entryTypes: task.readingContent.entryType || [] },
                  }
                : EMPTY_READING_CONTENT
            }
            onSave={handleReadingSave}
          />
        )}

        {taskType === "grammar" && task.grammarContent && (
          <div className="flex flex-col gap-4">
            <GrammarLearning
              mode="disabled"
              value={grammarInfo}
              onChange={handleGrammarSaveOnParent}
            />
            <Button onClick={handleGrammarSave} disabled={isPending}>
              Save Grammar Content
            </Button>
          </div>
        )}

        {taskType === "vocabulary" && task?.vocabularyItems?.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold">Vocabulary Words</h3>
            {task.vocabularyItems.map((item: any) => (
              <VocabularyWord
                key={item.id}
                mode="disabled"
                initialData={{
                  id: item.id,
                  word: item.wordName,
                  definition: item.definition,
                  imageUrl: item.imageUrl,
                }}
                onSave={handleVocabularySave}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs Content ── */}
      <div className="border-b flex gap-2">
        {tabs.map((tab) => {
          const href = `/content-library/${taskId}/${taskType}/${tab}`;

          return (
            <Link
              key={tab}
              href={href}
              className={`px-5 py-2 rounded-t-lg text-sm font-medium ${
                pathname === href
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
