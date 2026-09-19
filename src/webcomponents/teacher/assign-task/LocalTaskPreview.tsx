"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/webcomponents/sameroute/class/tasks/QuestinRenderer";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

const htmlEntities: Record<string, string> = { nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };

const toPlainText = (value: unknown) =>
  String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|quot|apos|lt|gt);|&#(x?[0-9a-f]+);/gi, (entity, named, numeric) => {
      if (named) return htmlEntities[named.toLowerCase()] || entity;
      const code = numeric.toLowerCase().startsWith("x") ? parseInt(numeric.slice(1), 16) : parseInt(numeric, 10);
      return Number.isNaN(code) ? entity : String.fromCodePoint(code);
    })
    .replace(/\s+/g, " ")
    .trim();

export interface LocalTaskPreviewProps {
  title?: string;
  taskType?: string;
  questions?: any[];
  taskSections?: any[];
  taskCriteria?: any[];
  passMark?: number | null;
  passLogic?: string;
  awardingBody?: string;
  entryLevel?: string;
}

export const LocalTaskPreview = ({
  title,
  taskType = "READING",
  questions = [],
  taskSections = [],
  taskCriteria = [],
  passMark,
  passLogic,
  awardingBody,
  entryLevel,
}: LocalTaskPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  // Sort questions in sequence by Task Section order (Task 1 first, then Task 2, etc.)
  const orderedQuestions = React.useMemo(() => {
    if (!taskSections || taskSections.length <= 1) return questions || [];
    const sectionOrderMap = new Map<string, number>(
      taskSections.map((s: any, idx: number) => [s.id, idx]),
    );
    return [...(questions || [])].sort((a, b) => {
      const aOrder = (sectionOrderMap.get(a.sectionId || taskSections[0]?.id) ?? 0) as number;
      const bOrder = (sectionOrderMap.get(b.sectionId || taskSections[0]?.id) ?? 0) as number;
      return aOrder - bOrder;
    });
  }, [questions, taskSections]);

  const actualQuestions = (orderedQuestions || []).filter((q: any) => q.type !== "INSTRUCTION");
  const displayItems = actualQuestions.length > 0 ? actualQuestions : (orderedQuestions || []);
  const currentQuestion = displayItems[currentIndex];
  const totalQuestions = displayItems.length;

  const skillMeta: Record<string, { label: string; emoji: string }> = {
    READING: { label: "Reading", emoji: "📖" },
    WRITING: { label: "Writing", emoji: "✍️" },
    LISTENING: { label: "Listening", emoji: "🎧" },
    SPEAKING: { label: "Speaking", emoji: "🗣️" },
    GRAMMAR: { label: "Grammar", emoji: "📝" },
    VOCABULARY: { label: "Vocabulary", emoji: "💬" },
  };

  const totalCalculatedMarks = React.useMemo(() => {
    return questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0);
  }, [questions]);

  const renderMarkText = (val: string | number) => (
    <span className="font-bold text-slate-700">{val}</span>
  );

  const criteriaCodesNode = taskCriteria && taskCriteria.length > 0 ? (
    <span className="inline-flex items-center flex-wrap ml-1">
      {taskCriteria.map((c: any, i: number) => (
        <React.Fragment key={c.id || i}>
          {renderMarkText(c.code)}
          {i < taskCriteria.length - 1 && <span className="text-slate-300 font-bold mx-1">|</span>}
        </React.Fragment>
      ))}
    </span>
  ) : "Checklist";

  const renderMarksFraction = () => (
    <span className="inline-flex items-center ml-1">
      {renderMarkText(passMark ?? 0)}
      <span className="text-slate-400 font-bold px-1">/</span>
      {renderMarkText(totalCalculatedMarks)}
    </span>
  );

  let passRequirementNode: React.ReactNode = "N/A (Ungraded)";

  if (passLogic === "CRITERIA_AND_SCORE") {
    passRequirementNode = (
      <>
        Pass: {renderMarksFraction()} Marks <span className="text-slate-300 mx-1.5">|</span> Fulfill Criteria: {criteriaCodesNode}
      </>
    );
  } else if (passLogic === "CRITERIA_ONLY") {
    passRequirementNode = <>Fulfill Criteria: {criteriaCodesNode}</>;
  } else if (passLogic === "SCORE_ONLY" && passMark !== null && passMark !== undefined) {
    passRequirementNode = <>Pass: {renderMarksFraction()} Marks</>;
  }

  const currentSkill = skillMeta[taskType] || { label: taskType, emoji: "📄" };

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-slate-500">No questions added yet to preview.</div>;
  }

  // Determine active task section for the current question
  const activeSection =
    taskSections?.find((s: any) => s.id === (currentQuestion?.sectionId || taskSections?.[0]?.id)) ||
    taskSections?.[0] || {
      id: "sec_1",
      title: "Task 1",
      instruction: "Read the following text and answer the questions.",
      stimulusType: "IMAGE",
      content: "",
    };

  const hasStimulus = Boolean(
    (activeSection?.stimulusType === "IMAGE" && activeSection?.imageUrl) ||
      (activeSection?.stimulusType !== "IMAGE" &&
        activeSection?.content &&
        activeSection?.content.trim().length > 0),
  );

  const isReadingWithStimulus = taskType === "READING" && hasStimulus;

  // Find any instruction lines in this same section that apply
  const sectionInstructions = (orderedQuestions || []).filter(
    (q: any) =>
      q.type === "INSTRUCTION" &&
      (q.sectionId || taskSections?.[0]?.id) === (currentQuestion?.sectionId || taskSections?.[0]?.id),
  );

  const formatQuestion = (q: any) => {
    let baseConfig = q?.config || {};
    return {
      id: q?.id,
      type: q?.type,
      config: {
        options: [],
        ...baseConfig,
        question: q?.content || baseConfig.question || "",
        explanation: q?.explanation || baseConfig.explanation || "",
        marks: q?.marks || 1,
      },
    };
  };

  const isAnswered = (question: any) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.length > 0 && answer.every(Boolean);
    return typeof answer === "string" && answer.trim().length > 0;
  };

  const correctAnswer = (question: any) => {
    const config = question.config || {};
    if (typeof config.correctIndex === "number" && Array.isArray(config.options)) {
      return config.options[config.correctIndex] || "Not provided";
    }
    if (config.answer) return Array.isArray(config.answer) ? config.answer.join(", ") : config.answer;
    if (question.type === "WORD_BOX_MATCH") {
      return (config.sentences || []).map((sentence: any) => sentence.answer).filter(Boolean).join(", ") || "Not provided";
    }
    if (question.type === "MATCHING") {
      if (Array.isArray(config.pairs)) return config.pairs.map((pair: any) => `${pair.left} → ${pair.right}`).join(", ") || "Not provided";
      return (config.leftItems || []).map((left: string, index: number) => `${left} → ${config.rightItems?.[config.matches?.[String(index)] ?? index] || ""}`).join(", ") || "Not provided";
    }
    if (question.type === "ORDERING") return (config.correctOrder || config.items || []).join(" → ") || "Not provided";
    return "Not provided";
  };

  const isCorrect = (question: any) => {
    const answer = answers[question.id];
    const config = question.config || {};
    const normalize = (value: unknown) => toPlainText(value).toLowerCase();

    if (typeof config.correctIndex === "number" && Array.isArray(config.options)) {
      return normalize(answer) === normalize(config.options[config.correctIndex]);
    }
    if (question.type === "WORD_BOX_MATCH") {
      const expected = (config.sentences || []).map((sentence: any) => normalize(sentence.answer));
      return Array.isArray(answer) && expected.length > 0 && expected.every((value: string, index: number) => normalize(answer[index]) === value);
    }
    if (question.type === "MATCHING") {
      const expected = Array.isArray(config.pairs) && config.pairs.length > 0
        ? config.pairs.map((pair: any, index: number) => `${pair.id ?? index}::right-${index}`)
        : (config.leftItems || []).map((_: string, index: number) => `${index}::right-${config.matches?.[String(index)] ?? index}`);
      return Array.isArray(answer) && expected.length > 0 && expected.every((value: string) => answer.includes(value));
    }
    if (question.type === "ORDERING") {
      const expected = config.correctOrder || config.items || [];
      return Array.isArray(answer) && expected.length > 0 && answer.every((value: string, index: number) => normalize(value) === normalize(expected[index]));
    }
    return normalize(answer) === normalize(config.answer);
  };

  const resultRows = displayItems.map((question: any, index: number) => ({
    question,
    index,
    correct: isCorrect(question),
  }));
  const earnedMarks = resultRows.reduce((sum, result) => sum + (result.correct ? result.question.marks || 1 : 0), 0);
  const usesCriteria = passLogic === "CRITERIA_ONLY" || passLogic === "CRITERIA_AND_SCORE";
  const usesScore = passLogic === "SCORE_ONLY" || passLogic === "CRITERIA_AND_SCORE";
  const criteriaResults = usesCriteria
    ? taskCriteria.map((criterion: any) => {
        const mapped = resultRows.filter((result) => result.question.criterionId === criterion.id);
        const correct = mapped.filter((result) => result.correct).length;
        return { ...criterion, total: mapped.length, correct, fulfilled: mapped.length > 0 && correct === mapped.length };
      })
    : [];
  const criteriaPassed = criteriaResults.length > 0 && criteriaResults.every((criterion: any) => criterion.fulfilled);
  const scorePassed = !usesScore || passMark === null || passMark === undefined || earnedMarks >= passMark;
  const assessmentPassed = scorePassed && (!usesCriteria || criteriaPassed);

  const handleNext = () => {
    if (currentQuestion && isAnswered(currentQuestion) && currentIndex < totalQuestions - 1) {
      setCurrentIndex((c) => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((c) => c - 1);
  };

  const restart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    const percentage = totalCalculatedMarks ? Math.round((earnedMarks / totalCalculatedMarks) * 100) : 0;
    const correctCount = resultRows.filter((result) => result.correct).length;
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-none">
          <div className="bg-slate-900 px-6 py-8 sm:px-10 sm:py-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider"><CheckCircle2 className="w-4 h-4 text-emerald-400" />Assessment complete</span>
                <h2 className="text-3xl font-semibold tracking-tight">{percentage}% score</h2>
                <p className="text-slate-300 text-sm">{correctCount} of {totalQuestions} questions correct · {earnedMarks} of {totalCalculatedMarks} marks</p>
                {(usesScore || usesCriteria) && (
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${assessmentPassed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                    {assessmentPassed ? "Pass" : "Not yet passed"}
                  </span>
                )}
              </div>
              <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-bold leading-none">{earnedMarks}</span>
                <span className="text-xs text-slate-400 mt-1">/ {totalCalculatedMarks}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-slate-50/60 border-t border-slate-200/70">
            <p className="text-xs sm:text-[13px] text-slate-500">Review each answer below and use the explanations to learn from mistakes.</p>
            <Button variant="outline" onClick={restart} className="bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 h-8.5 rounded-lg text-xs font-medium shadow-none shrink-0"><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Try again</Button>
          </div>
        </div>

        {usesCriteria && (
          <div className="rounded-xl border border-slate-200/70 bg-white overflow-hidden shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-200/70 bg-slate-50/60">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Skill criteria checklist</h3>
                <p className="text-xs text-slate-500 mt-0.5">Every mapped question must be correct for a criterion to be fulfilled.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${criteriaPassed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{criteriaResults.filter((criterion: any) => criterion.fulfilled).length} / {criteriaResults.length} fulfilled</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
              {criteriaResults.map((criterion: any) => (
                <div key={criterion.id} className={`rounded-lg border p-4 ${criterion.fulfilled ? "border-emerald-200/80 bg-emerald-50/40" : "border-red-200/80 bg-red-50/40"}`}>
                  <div className="flex items-start gap-3">
                    {criterion.fulfilled ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-xs">{criterion.code}</p>
                      {criterion.description && <p className="text-xs text-slate-500 mt-0.5">{criterion.description}</p>}
                      <p className={`text-xs font-medium mt-2 ${criterion.fulfilled ? "text-emerald-700" : "text-red-700"}`}>{criterion.correct} of {criterion.total} mapped questions correct · {criterion.fulfilled ? "Fulfilled" : "Not fulfilled"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {resultRows.map(({ question, index, correct }) => (
            <div key={question.id} className="rounded-xl border border-slate-200/70 bg-white overflow-hidden shadow-none">
              <div className={`flex items-center gap-3 px-5 py-3 border-b ${correct ? "bg-emerald-50/60 border-emerald-100" : "bg-red-50/60 border-red-100"}`}>
                {correct ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                <span className={`text-xs font-semibold uppercase tracking-wider ${correct ? "text-emerald-700" : "text-red-700"}`}>Question {index + 1} · {correct ? "Correct" : "Review needed"}</span>
                <span className="ml-auto text-xs font-medium text-slate-500">{question.marks || 1} {question.marks === 1 ? "mark" : "marks"}</span>
              </div>
              <div className="p-5 sm:p-6 space-y-5">
                <p className="text-base font-semibold leading-relaxed text-slate-900">{toPlainText(question.content)}</p>
                <div className={`grid gap-3 ${correct ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Your answer</p>
                    <p className="font-medium text-slate-800 text-sm">{toPlainText(Array.isArray(answers[question.id]) ? answers[question.id].join(", ") : answers[question.id])}</p>
                  </div>
                  {!correct && <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1.5">Correct answer</p>
                    <p className="font-semibold text-emerald-900 text-sm">{toPlainText(correctAnswer(question))}</p>
                  </div>}
                </div>
                {question.explanation && <div className="rounded-lg border border-slate-200/70 bg-slate-50/50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Why this is the answer</p>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600">{toPlainText(question.explanation)}</p>
                </div>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            {title || "Untitled Activity"}
          </h1>
          <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shadow-none">
            <span>{currentSkill.emoji}</span> {currentSkill.label}
          </span>
          {awardingBody && awardingBody !== "CUSTOM" && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200/80 shadow-none">
              {awardingBody}
            </span>
          )}
          {entryLevel && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200/80 shadow-none">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}
          {passRequirementNode !== "N/A (Ungraded)" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/80 flex items-center gap-1.5 shadow-none ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              {passRequirementNode}
            </span>
          )}
        </div>
        <div className="text-xs font-medium text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-none">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 shadow-none">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 min-w-[3rem] text-right">
          {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
        </span>
      </div>

      {/* Split Screen Layout if Task has Stimulus Material */}
      {isReadingWithStimulus ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Persistent Stimulus Material (50%) */}
          <div className="lg:col-span-6 flex flex-col gap-3 sticky top-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="bg-white rounded-xl border border-slate-200/70 shadow-none overflow-hidden flex flex-col">
              {/* Task Section Banner */}
              <div className="px-5 py-3.5 bg-white border-b border-slate-100 text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 px-2.5 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center shadow-none">
                    {activeSection.title || "Task 1"}
                  </span>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[280px]">
                    {activeSection.instruction || "Read the text and answer questions."}
                  </span>
                </div>
                {activeSection.stimulusType === "IMAGE" && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-none">
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-slate-600 hover:text-primary/90 font-bold text-base transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      −
                    </button>
                    <span
                      onClick={() => setImageZoom(1)}
                      className="min-w-[42px] text-center font-semibold text-slate-800 text-xs select-none cursor-pointer hover:text-primary transition-colors"
                      title="Click to reset to 100%"
                    >
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white text-slate-600 hover:text-primary/90 font-bold text-base transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Stimulus Body */}
              <div className="p-4 sm:p-5 bg-slate-50/50 min-h-[340px] flex items-start justify-center">
                {activeSection.stimulusType === "IMAGE" && activeSection.imageUrl ? (
                  <div className="overflow-auto max-h-[64vh] w-full flex items-start justify-center p-1">
                    <div
                      className="rounded-xl bg-white p-2.5 sm:p-3 border border-slate-200/80 shadow-xs flex items-center justify-center transition-all duration-150"
                      style={{
                        maxWidth: imageZoom <= 1 ? "100%" : "none",
                      }}
                    >
                      <img
                        src={activeSection.imageUrl}
                        alt="Exam Stimulus Graphic"
                        className="rounded-lg object-contain transition-all duration-150 select-none"
                        style={{
                          maxHeight: `${54 * imageZoom}vh`,
                          maxWidth: imageZoom <= 1 ? "100%" : `${imageZoom * 100}%`,
                          width: "auto",
                          height: "auto",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm prose-slate max-w-none w-full bg-white p-6 rounded-xl border border-slate-200/70 shadow-none leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeSection.content }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Active Question (50%) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-slate-200/70 shadow-none p-6 sm:p-7 flex flex-col gap-6">
              {/* Section Instruction Line Banner */}
              {currentQuestion?.type !== "INSTRUCTION" && sectionInstructions.length > 0 && (
                <div className="space-y-2">
                  {sectionInstructions.map((inst: any) => (
                    <div
                      key={inst.id}
                      className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg"
                    >
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {inst.content || inst.config?.heading || "Instruction"}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion?.type === "INSTRUCTION" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>📄 Instruction Line</span>
                  </div>
                  <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-lg space-y-1 text-slate-800">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {currentQuestion.content || currentQuestion.config?.heading || "Instruction"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Question {currentIndex + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentQuestion?.criterionId && taskCriteria && (
                        <span 
                          className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-none" 
                          title={taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.description}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                          {taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.code || "Mapped"}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200/80 px-2 py-0.5 rounded-md shadow-none">
                        <span className="font-bold text-slate-800 mr-0.5">
                          {currentQuestion?.marks ?? 1}
                        </span>
                        {(currentQuestion?.marks ?? 1) === 1 ? "Mark" : "Marks"}
                      </span>
                    </div>
                  </div>

                  <QuestionRenderer
                    question={formatQuestion(currentQuestion) as any}
                    userAnswer={answers[currentQuestion?.id]}
                    setAnswer={(ans) =>
                      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: ans }))
                    }
                    submitted={submitted}
                  />
                </>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 h-9 rounded-lg shadow-none cursor-pointer"
              >
                Previous
              </Button>

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered(currentQuestion)}
                  className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-none transition-colors cursor-pointer disabled:opacity-50"
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={() => setSubmitted(true)}
                  disabled={!isAnswered(currentQuestion)}
                  className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-none transition-colors cursor-pointer disabled:opacity-50"
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Focused Centered Layout for Tasks without Stimulus */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/70 shadow-none p-6 md:p-8 flex flex-col gap-6">
            {/* Task Banner */}
            {activeSection?.title && (
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <span className="h-6 px-2.5 rounded-lg bg-primary text-white text-[11px] font-semibold flex items-center shadow-none">
                  {activeSection.title}
                </span>
                {activeSection.instruction && (
                  <span className="text-xs font-medium text-slate-600">
                    {activeSection.instruction}
                  </span>
                )}
              </div>
            )}

            {/* Section Instruction Line Banner */}
            {currentQuestion?.type !== "INSTRUCTION" && sectionInstructions.length > 0 && (
              <div className="space-y-2">
                {sectionInstructions.map((inst: any) => (
                  <div
                    key={inst.id}
                    className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-lg"
                  >
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {inst.content || inst.config?.heading || "Instruction"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion?.type === "INSTRUCTION" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>📄 Instruction Line</span>
                </div>
                <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-lg space-y-1 text-slate-800">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {currentQuestion.content || currentQuestion.config?.heading || "Instruction"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Question {currentIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentQuestion?.criterionId && taskCriteria && (
                      <span 
                        className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-none" 
                        title={taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.description}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                        {taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.code || "Mapped"}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100/80 border border-slate-200/80 px-2 py-0.5 rounded-md shadow-none">
                      <span className="font-bold text-slate-800 mr-0.5">
                        {currentQuestion?.marks ?? 1}
                      </span>
                      {(currentQuestion?.marks ?? 1) === 1 ? "Mark" : "Marks"}
                    </span>
                  </div>
                </div>

                <QuestionRenderer
                  question={formatQuestion(currentQuestion) as any}
                  userAnswer={answers[currentQuestion?.id]}
                  setAnswer={(ans) =>
                    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: ans }))
                  }
                  submitted={submitted}
                />
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs px-4 h-9 rounded-lg shadow-none cursor-pointer"
            >
              Previous
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isAnswered(currentQuestion)}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-none transition-colors cursor-pointer disabled:opacity-50"
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={() => setSubmitted(true)}
                disabled={!isAnswered(currentQuestion)}
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-5 h-9 rounded-lg shadow-none transition-colors cursor-pointer disabled:opacity-50"
              >
                Submit Assessment
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
