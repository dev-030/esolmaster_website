"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/webcomponents/sameroute/class/tasks/QuestinRenderer";

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

  const renderMarksBox = (val: string | number) => (
    <span className="bg-amber-100/80 text-amber-900 px-1.5 rounded-[3px] border border-amber-300/60 shadow-xs mx-0.5 min-w-[1.25rem] text-center inline-block">{val}</span>
  );

  const criteriaCodesNode = taskCriteria && taskCriteria.length > 0 ? (
    <span className="inline-flex items-center flex-wrap gap-0.5 ml-1">
      {taskCriteria.map((c: any, i: number) => (
        <React.Fragment key={c.id || i}>
          {renderMarksBox(c.code)}
          {i < taskCriteria.length - 1 && <span className="text-amber-300/80 text-[10px] px-0.5">|</span>}
        </React.Fragment>
      ))}
    </span>
  ) : "Checklist";

  const renderMarksFraction = () => (
    <span className="inline-flex items-center ml-1">
      {renderMarksBox(passMark ?? 0)}
      <span className="text-amber-400 font-black px-0.5">/</span>
      {renderMarksBox(totalCalculatedMarks)}
    </span>
  );

  let passRequirementNode: React.ReactNode = "N/A (Ungraded)";

  if (passLogic === "CRITERIA_AND_SCORE") {
    passRequirementNode = (
      <>
        Pass: {renderMarksFraction()} Marks <span className="text-amber-300 mx-1.5">|</span> Fulfill Criteria: {criteriaCodesNode}
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

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((c) => c + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((c) => c - 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {title || "Untitled Activity"}
          </h1>
          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-500 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
            <span>{currentSkill.emoji}</span> {currentSkill.label}
          </span>
          {awardingBody && awardingBody !== "CUSTOM" && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-500 border border-blue-200">
              {awardingBody}
            </span>
          )}
          {entryLevel && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}
          {passRequirementNode !== "N/A (Ungraded)" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-2xs ml-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
              {passRequirementNode}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-500 min-w-[3rem] text-right">
          {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
        </span>
      </div>

      {/* Split Screen Layout if Task has Stimulus Material */}
      {isReadingWithStimulus ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Persistent Stimulus Material (50%) */}
          <div className="lg:col-span-6 flex flex-col gap-3 sticky top-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
              {/* Task Section Banner */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                    {activeSection.title || "Task 1"}
                  </span>
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[280px]">
                    {activeSection.instruction || "Read the text and answer questions."}
                  </span>
                </div>
                {activeSection.stimulusType === "IMAGE" && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.max(0.5, z - 0.25))}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 font-bold text-base transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      −
                    </button>
                    <span className="min-w-[42px] text-center font-bold text-slate-800 text-xs select-none">
                      {Math.round(imageZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageZoom((z) => Math.min(2.5, z + 0.25))}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 hover:text-blue-600 font-bold text-base transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Stimulus Body */}
              <div className="p-4 bg-slate-50/50 min-h-[300px] flex items-center justify-center">
                {activeSection.stimulusType === "IMAGE" && activeSection.imageUrl ? (
                  <div className="overflow-auto max-h-[60vh] w-full flex justify-center">
                    <img
                      src={activeSection.imageUrl}
                      alt="Exam Stimulus Graphic"
                      className="rounded-lg shadow-sm border border-slate-200 object-contain transition-transform origin-top"
                      style={{
                        transform: `scale(${imageZoom})`,
                        maxWidth: imageZoom <= 1 ? "100%" : "none",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="prose prose-sm prose-slate max-w-none w-full bg-white p-5 rounded-lg border border-slate-200 shadow-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: activeSection.content }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Active Question (50%) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
              {/* Section Instruction Line Banner */}
              {currentQuestion?.type !== "INSTRUCTION" && sectionInstructions.length > 0 && (
                <div className="space-y-2">
                  {sectionInstructions.map((inst: any) => (
                    <div
                      key={inst.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl"
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
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span>📄 Instruction Line</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-800">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {currentQuestion.content || currentQuestion.config?.heading || "Instruction"}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                      Question {currentIndex + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentQuestion?.criterionId && taskCriteria && (
                        <span 
                          className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1" 
                          title={taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.description}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                          {taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.code || "Mapped"}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 pl-0.5 pr-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="bg-slate-200/80 text-slate-700 px-1 rounded-[3px] border border-slate-300/50 shadow-xs min-w-[1rem] text-center inline-block">
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
                className="border-slate-200 text-slate-500 hover:text-slate-700"
              >
                Previous
              </Button>

              {currentIndex < totalQuestions - 1 ? (
                <Button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={() => setSubmitted(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8 flex flex-col gap-5">
            {/* Task Banner */}
            {activeSection?.title && (
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <span className="bg-blue-50 text-blue-500 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
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
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl"
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
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>📄 Instruction Line</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-800">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {currentQuestion.content || currentQuestion.config?.heading || "Instruction"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">
                    Question {currentIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentQuestion?.criterionId && taskCriteria && (
                      <span 
                        className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1" 
                        title={taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.description}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                        {taskCriteria.find((c: any) => c.id === currentQuestion.criterionId)?.code || "Mapped"}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 pl-0.5 pr-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="bg-slate-200/80 text-slate-700 px-1 rounded-[3px] border border-slate-300/50 shadow-xs min-w-[1rem] text-center inline-block">
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
              className="border-slate-200 text-slate-500 hover:text-slate-700"
            >
              Previous
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 text-white">
                Next Question
              </Button>
            ) : (
              <Button
                onClick={() => setSubmitted(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
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
