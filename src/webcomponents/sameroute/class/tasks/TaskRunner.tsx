/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, X, BookOpen, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { QuestionRenderer } from "./QuestinRenderer";
import { ResultScreen } from "./ResultScreen";

import {
  useGetAttemptQuery,
  useStartAttemptMutation,
  useSubmitAnswerMutation,
} from "@/api/attempt";
import { Flashcard } from "./learnings/FlashcardWord";
import { GrammarContent } from "./learnings/GrammarContent";
import { ReadingContent } from "./learnings/ReadingContent";

export const TaskRunner = ({ taskIdProp }: { taskIdProp?: string }) => {
  const params = useParams<{ classId: string; taskId: string }>();
  const router = useRouter();
  const taskId = taskIdProp || params?.taskId;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, any>>({});
  const [localIndex, setLocalIndex] = useState<number | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [startError, setStartError] = useState("");
  const submitQueue = useRef(Promise.resolve());
  const queuedQuestions = useRef(new Set<string>());

  const { mutateAsync: startAttempt } = useStartAttemptMutation();
  const { mutateAsync: submitAnswer } = useSubmitAnswerMutation();

  const { data: attempt, isLoading, refetch } = useGetAttemptQuery(attemptId!);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await startAttempt(taskId);
        setAttemptId(res.id);
      } catch (error: any) {
        setStartError(error?.response?.data?.message || "This activity is not available.");
      }
    };
    init();
  }, [taskId, startAttempt]);

  useEffect(() => {
    if (!attempt) return;
    const key = `esolmaster:attempt:${attempt.id}`;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      setDraftAnswers(saved?.answers ?? {});
      setLocalIndex(typeof saved?.currentIndex === "number" ? saved.currentIndex : attempt.currentQuestionIndex);
    } catch {
      setDraftAnswers({});
      setLocalIndex(attempt.currentQuestionIndex);
    }
  }, [attempt?.id]);

  useEffect(() => {
    if (!attempt || localIndex === null || attempt.status === "COMPLETED") return;
    try {
      localStorage.setItem(`esolmaster:attempt:${attempt.id}`, JSON.stringify({
        currentIndex: localIndex,
        answers: draftAnswers,
      }));
    } catch { /* storage unavailable */ }
  }, [attempt?.id, attempt?.status, localIndex, draftAnswers]);

  const handleBack = () => router.back();

  // ── Error State ──────────────────────────────────────────────
  if (startError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm max-w-md w-full">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <p className="font-bold text-slate-900">Activity unavailable</p>
          <p className="mt-1 text-sm text-slate-500">{startError}</p>
          <Button onClick={handleBack} className="mt-5 bg-[#3454FB] hover:bg-[#2B44C9]">
            <ArrowLeft className="h-4 w-4 mr-1" /> Go back
          </Button>
        </div>
      </div>
    );
  }

  // ── Loading State ────────────────────────────────────────────
  if (isLoading || !attempt) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3454FB]" />
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────
  const task = attempt.task;
  const questions = task.questions;
  const currentIndex = localIndex ?? attempt.currentQuestionIndex;
  const currentQuestion = questions[currentIndex];
  const answer = currentQuestion ? draftAnswers[currentQuestion.id] ?? null : null;
  const totalQuestions = questions.length;

  const answeredMap = new Map(attempt.answers?.map((a: any) => [a.questionId, true]) ?? []);
  const answeredArray = questions.map((q: any) =>
    answeredMap.has(q.id) || Object.prototype.hasOwnProperty.call(draftAnswers, q.id)
  );
  const answeredCount = answeredArray.filter(Boolean).length;
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const taskSections = (() => {
    try {
      const parsed = JSON.parse(task.readingContent?.content ?? "{}");
      return Array.isArray(parsed.sections) ? parsed.sections : [];
    } catch { return []; }
  })();

  const activeSection = taskSections.find((s: any) => s.id === currentQuestion?.config?.sectionId) ?? taskSections[0];
  const hasStimulus = Boolean(activeSection?.imageUrl || activeSection?.content);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const queueAnswer = (question: any, value: any) => {
    if (queuedQuestions.current.has(question.id)) return submitQueue.current;
    queuedQuestions.current.add(question.id);
    submitQueue.current = submitQueue.current
      .catch(() => undefined)
      .then(async () => {
        try {
          await submitAnswer({ attemptId: attempt.id, questionId: question.id, answerData: value });
        } catch (e) {
          queuedQuestions.current.delete(question.id);
          throw e;
        }
      });
    return submitQueue.current;
  };

  const handleSubmit = async () => {
    if (!currentQuestion || isFinalizing) return;
    setIsFinalizing(isLast);
    const serverAnswers = new Set((attempt.answers ?? []).map((item: any) => item.questionId));

    if (isLast) {
      const pending = questions.filter((q: any) =>
        !serverAnswers.has(q.id) && !queuedQuestions.current.has(q.id)
      );
      for (const q of pending) {
        queueAnswer(q, Object.prototype.hasOwnProperty.call(draftAnswers, q.id) ? draftAnswers[q.id] : null);
      }
      try {
        await submitQueue.current;
        localStorage.removeItem(`esolmaster:attempt:${attempt.id}`);
        await refetch();
      } finally {
        setIsFinalizing(false);
      }
    } else {
      queueAnswer(currentQuestion, answer);
      setLocalIndex((i) => Math.min((i ?? 0) + 1, totalQuestions - 1));
    }
  };

  // ── Completed ─────────────────────────────────────────────────
  if (attempt.status === "COMPLETED") {
    return (
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="border-b border-slate-100 bg-white px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-slate-600">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <span className="text-base font-bold text-slate-900">{task.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <ResultScreen result={attempt.result} />
        </div>
      </div>
    );
  }

  // ── Main Layout ───────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Top Header Bar ──────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-slate-500 hover:text-slate-800 shrink-0">
            <X className="h-4 w-4" />
          </Button>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-slate-900">{task.title}</p>
            <p className="text-[11px] font-medium text-slate-400">
              Question {currentIndex + 1} of {totalQuestions} &middot; {answeredCount} answered
            </p>
          </div>
        </div>

        {/* Pass Info Pills */}
        <div className="hidden sm:flex items-center gap-2">
          {task.readingContent?.passMark != null && (
            <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              Pass: <span className="font-black text-slate-800">{task.readingContent.passMark}</span>
              <span className="text-slate-400 mx-1">/</span>
              <span className="font-black text-slate-800">{questions.reduce((s: number, q: any) => s + (q.config?.marks ?? 1), 0)}</span>
              {" "}marks
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLearning((p) => !p)}
            className="gap-1.5 border-slate-200 text-slate-600 text-xs font-semibold rounded-[10px]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {showLearning ? "Back to Questions" : "Learning Section"}
          </Button>
        </div>
      </header>

      {/* ── Progress Bar ────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3454FB] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 tabular-nums shrink-0">{progressPct}%</span>
        </div>
        {/* Question dots */}
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {questions.map((_: any, i: number) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? "bg-[#3454FB] w-5 h-2"
                  : answeredArray[i]
                  ? "bg-[#3454FB]/30 w-2 h-2"
                  : "bg-slate-200 w-2 h-2"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {showLearning ? (
          <div className="mx-auto max-w-4xl p-6">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
              {task.type === "VOCABULARY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {task.vocabularyItems?.map((item: any) => (
                    <Flashcard key={item.id} word={item.wordName} definition={item.definition} image={item.imageUrl} />
                  ))}
                </div>
              )}
              {task.type === "GRAMMAR" && task.grammarContent && <GrammarContent data={task.grammarContent} />}
              {task.type === "READING" && task.readingContent && <ReadingContent data={task.readingContent} />}
            </div>
          </div>
        ) : (
          <div className={`h-full ${hasStimulus ? "grid grid-cols-1 xl:grid-cols-2" : "flex flex-col"}`}>

            {/* Left: Stimulus / Reading passage */}
            {hasStimulus && (
              <div className="border-r border-slate-100 bg-white overflow-y-auto">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <span className="rounded-lg bg-[#3454FB] px-2.5 py-1 text-xs font-bold text-white">
                    {activeSection?.title || "Task 1"}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-500">
                    {activeSection?.instruction || "Read the text and answer the questions."}
                  </span>
                </div>
                <div className="p-5">
                  {activeSection?.imageUrl ? (
                    <img
                      src={activeSection.imageUrl}
                      alt={activeSection.title || "Stimulus"}
                      className="w-full rounded-xl border border-slate-100 object-contain max-h-[70vh]"
                    />
                  ) : (
                    <div
                      className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: (activeSection?.content || "").replace(/&nbsp;/g, " ") }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Right: Question panel */}
            <div className={`flex flex-col bg-[#F7F9FC] overflow-y-auto ${!hasStimulus ? "flex-1" : ""}`}>
              <div className={`${!hasStimulus ? "mx-auto w-full max-w-2xl" : ""} flex-1 p-5 sm:p-6`}>

                {/* Question header */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#3454FB]">
                    Question {currentIndex + 1}
                  </span>
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {currentQuestion?.config?.marks ?? 1} {(currentQuestion?.config?.marks ?? 1) === 1 ? "mark" : "marks"}
                  </span>
                </div>

                {/* Question content */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
                  {currentQuestion && (
                    <QuestionRenderer
                      key={currentQuestion.id}
                      question={currentQuestion}
                      userAnswer={answer}
                      setAnswer={(ans) => setDraftAnswers((prev) => ({ ...prev, [currentQuestion.id]: ans }))}
                      submitted={false}
                    />
                  )}
                </div>
              </div>

              {/* ── Footer Navigation ── */}
              <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div className={`flex items-center ${!hasStimulus ? "mx-auto max-w-2xl" : ""} justify-between`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocalIndex((i) => Math.max((i ?? 0) - 1, 0))}
                    disabled={isFirst || isFinalizing}
                    className="gap-1.5 border-slate-200 text-slate-600 font-semibold rounded-[10px]"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <span className="text-xs font-semibold text-slate-400">
                    {currentIndex + 1} / {totalQuestions}
                  </span>

                  {isLast ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!( currentQuestion?.type === "INSTRUCTION" || answer !== null) || isFinalizing}
                      className="gap-1.5 bg-[#3454FB] hover:bg-[#2B44C9] font-semibold rounded-[10px]"
                      size="sm"
                    >
                      {isFinalizing
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                        : <><CheckCircle className="h-4 w-4" /> Submit Task</>
                      }
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!( currentQuestion?.type === "INSTRUCTION" || answer !== null) || isFinalizing}
                      className="gap-1.5 bg-[#3454FB] hover:bg-[#2B44C9] font-semibold rounded-[10px]"
                      size="sm"
                    >
                      {isFinalizing
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                        : <>Next <ChevronRight className="h-4 w-4" /></>
                      }
                    </Button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
