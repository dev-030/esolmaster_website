/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ProgressBar } from "./ProgressBar";
import { QuestionRenderer } from "./QuestinRenderer";
import { NavigationButtons } from "./NavigationButton";
import { ResultScreen } from "./ResultScreen";


import {
  useGetAttemptQuery,
  useStartAttemptMutation,
  useSubmitAnswerMutation,
} from "@/api/attempt";
import { Flashcard } from "./learnings/FlashcardWord";
import { GrammarContent } from "./learnings/GrammarContent";
import { ReadingContent } from "./learnings/ReadingContent";

const TASK_TYPE_META: Record<
  string,
  { label: string; emoji: string; variant: "info" | "success" | "warning" }
> = {
  grammar: { label: "Grammar", emoji: "📝", variant: "info" },
  reading: { label: "Reading", emoji: "📖", variant: "success" },
  vocabulary: { label: "Vocabulary", emoji: "💬", variant: "warning" },
};

export const TaskRunner = ({ taskIdProp }: { taskIdProp?: string }) => {
  const params = useParams<{ taskId: string }>();
  const taskId = taskIdProp || params?.taskId;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [showLearning, setShowLearning] = useState(false); // ✅ NEW

  const { mutateAsync: startAttempt } = useStartAttemptMutation();
  const { mutateAsync: submitAnswer } = useSubmitAnswerMutation();

  const {
    data: attempt,
    isLoading,
    refetch,
  } = useGetAttemptQuery(attemptId!);

  // start attempt
  useEffect(() => {
    const init = async () => {
      const res = await startAttempt(taskId);
      setAttemptId(res.id);
    };
    init();
  }, [taskId, startAttempt]);

  if (isLoading || !attempt) {
    return <div>Loading task...</div>;
  }

  const task = attempt.task;
  const meta = TASK_TYPE_META[task.type.toLowerCase()];

  const questions = task.questions;
  const currentIndex = attempt.currentQuestionIndex;
  const currentQuestion = questions[currentIndex];

  const totalQuestions = questions.length;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    await submitAnswer({
      attemptId: attempt.id,
      questionId: currentQuestion.id,
      answerData: answer,
    });

    setAnswer(null);
    await refetch();
  };

  const answeredMap = new Map(
    attempt.answers?.map((a: any) => [a.questionId, true]) ?? [],
  );
  const answeredArray = questions.map((q: any) => !!answeredMap.get(q.id));

  const handleNavigate = async (index: number) => {
    // For now, we don't support direct navigation in this mode
    // but this is where the logic would go.
    console.log("Navigating to question", index);
  };

  // ✅ COMPLETED SCREEN
  if (attempt.status === "COMPLETED") {
    return <ResultScreen result={attempt.result} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">
            {task.title}
          </h1>

          <Badge variant={meta.variant} className="gap-1">
            <span>{meta.emoji}</span>
            {meta.label}
          </Badge>
        </div>

        {/* ✅ Learning Toggle Button */}
        <Button
          variant="outline"
          onClick={() => setShowLearning((prev) => !prev)}
        >
          {showLearning ? "Back to Questions" : "Learning Section"}
        </Button>
      </div>

      {/* ✅ LEARNING SECTION */}
      {showLearning ? (
        <div className="rounded-xl border bg-card shadow-sm p-6">
          {/* VOCABULARY */}
          {task.type === "VOCABULARY" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {task.vocabularyItems?.map((item: any) => (
                <Flashcard
                  key={item.id}
                  word={item.wordName}
                  definition={item.definition}
                  image={item.imageUrl}
                />
              ))}
            </div>
          )}

          {/* GRAMMAR */}
          {task.type === "GRAMMAR" && task.grammarContent && (
            <GrammarContent data={task.grammarContent} />
          )}

          {/* READING */}
          {task.type === "READING" && task.readingContent && (
            <ReadingContent data={task.readingContent} />
          )}
        </div>
      ) : (
        <>
          {/* Progress */}
          <ProgressBar
            current={currentIndex}
            total={totalQuestions}
            answered={answeredArray}
            onNavigate={handleNavigate}
          />

          {/* Question */}
          <div className="rounded-xl border bg-card shadow-sm p-6 min-h-70">
            {currentQuestion && (
              <QuestionRenderer
                key={currentQuestion.id}
                question={currentQuestion}
                userAnswer={answer}
                setAnswer={(ans) => setAnswer(ans)}
                submitted={false}
              />
            )}
          </div>

          {/* Navigation */}
          <NavigationButtons
            isFirst={isFirst}
            isLast={isLast}
            canProceed={answer !== null}
            onPrev={() => {}}
            onNext={handleSubmit}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
};