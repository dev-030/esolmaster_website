"use client";

import React from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const htmlEntities: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  pound: "£",
  euro: "€",
  yen: "¥",
  cent: "¢",
  copy: "©",
  reg: "®",
  deg: "°",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  bull: "•",
};

export const cleanHtmlText = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let str = String(value);

  // Replace <br> and paragraph breaks with clean whitespace
  str = str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "");

  // Decode common named & numeric entities
  str = str.replace(
    /&(nbsp|amp|quot|apos|lt|gt|pound|euro|yen|cent|copy|reg|deg|hellip|ndash|mdash|lsquo|rsquo|ldquo|rdquo|bull);|&#(x?[0-9a-f]+);/gi,
    (entity, named, numeric) => {
      if (named) return htmlEntities[named.toLowerCase()] || entity;
      const code = numeric.toLowerCase().startsWith("x")
        ? parseInt(numeric.slice(1), 16)
        : parseInt(numeric, 10);
      return Number.isNaN(code) ? entity : String.fromCodePoint(code);
    },
  );

  return str.replace(/[ \t\f\v]+/g, " ").replace(/\n\s*\n/g, "\n\n").trim();
};

interface TaskOverviewAnswerKeyProps {
  taskData: {
    title: string;
    taskType: string;
    questions: any[];
    taskSections: any[];
    taskCriteria?: any[];
    passMark?: number | null;
    passLogic?: string;
    awardingBody?: string;
    entryLevel?: string;
  };
}

export const TaskOverviewAnswerKey = ({ taskData }: TaskOverviewAnswerKeyProps) => {
  const {
    title,
    taskType,
    questions,
    taskSections,
    taskCriteria = [],
    passMark,
    passLogic,
    awardingBody,
    entryLevel,
  } = taskData;

  const criteriaMap = new Map(taskCriteria.map((c: any) => [c.id, c]));

  const totalMarks = questions.reduce(
    (acc, q) => acc + (typeof q.marks === "number" ? q.marks : 1),
    0,
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ── Summary Cards Header ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 rounded-xl border-slate-200/70 bg-white shadow-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Activity Type</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900 capitalize">
            {taskType.toLowerCase()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
            {awardingBody ? `${awardingBody} · ` : ""}
            {entryLevel
              ? entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")
              : "Standard"}
          </p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 bg-white shadow-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <HelpCircle className="w-4 h-4 text-purple-600" />
            <span>Total Questions</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {questions.length} questions
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
            Across {taskSections.length} section
            {taskSections.length !== 1 ? "s" : ""}
          </p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 bg-white shadow-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Marks & Scoring</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {totalMarks} Total Marks
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
            {passMark
              ? `Pass Mark: ${passMark} marks`
              : "Scored by completion rate"}
          </p>
        </Card>

        <Card className="p-4 rounded-xl border-slate-200/70 bg-white shadow-none">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Marking Criteria</span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {taskCriteria.length > 0
              ? `${taskCriteria.length} criteria defined`
              : "Standard Marking"}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
            {passLogic || "All criteria must be attempted"}
          </p>
        </Card>
      </div>

      {/* ── Criteria List (if applicable) ── */}
      {taskCriteria.length > 0 && (
        <Card className="p-5 rounded-xl border-slate-200/70 bg-white shadow-none space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Assessment Criteria / Learning Outcomes
            </h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {taskCriteria.map((crit, idx) => (
              <div
                key={crit.id || idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
              >
                <span className="font-mono font-bold text-slate-700 shrink-0 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                  {crit.code || `C${idx + 1}`}
                </span>
                <span className="text-slate-600 font-medium">
                  {cleanHtmlText(crit.description || crit.title)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Sections Breakdown & Questions ── */}
      <div className="space-y-6">
        {taskSections.map((section, secIdx) => {
          const sectionQuestions = questions.filter(
            (q) => q.sectionId === section.id || (!q.sectionId && secIdx === 0),
          );

          return (
            <div
              key={section.id || secIdx}
              className="rounded-xl border border-slate-200/70 bg-white shadow-none overflow-hidden"
            >
              {/* Section Header & Reading Stimulus */}
              <div className="border-b border-slate-100 bg-slate-50/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 px-2 rounded-md bg-primary text-white text-xs font-semibold flex items-center">
                      Section {secIdx + 1}
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">
                      {cleanHtmlText(section.title || `Task ${secIdx + 1}`)}
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {sectionQuestions.length} Question
                    {sectionQuestions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {section.instruction && (
                  <p className="text-xs text-slate-500 font-normal italic">
                    {cleanHtmlText(section.instruction)}
                  </p>
                )}

                {/* Stimulus Text or Image */}
                {(section.content || section.imageUrl) && (
                  <div className="mt-3 p-4 rounded-xl border border-slate-200/70 bg-white text-sm text-slate-700 leading-relaxed shadow-none space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Reading / Stimulus Material</span>
                    </div>

                    {section.imageUrl && (
                      <div className="max-w-md overflow-hidden rounded-lg border border-slate-100">
                        <img
                          src={section.imageUrl}
                          alt="Section Stimulus"
                          className="w-full object-contain"
                        />
                      </div>
                    )}

                    {section.content && (
                      <div className="whitespace-pre-line prose prose-slate max-w-none text-slate-800 text-sm">
                        {cleanHtmlText(section.content)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Questions in this section */}
              <div className="p-5 space-y-4 divide-y divide-slate-100">
                {sectionQuestions.map((question, qIdx) => {
                  const globalIdx = questions.findIndex((q) => q.id === question.id);
                  const displayNum = globalIdx !== -1 ? globalIdx + 1 : qIdx + 1;
                  const cfg = question.config || {};

                  return (
                    <div
                      key={question.id || qIdx}
                      className={cn("space-y-3", qIdx > 0 && "pt-4")}
                    >
                      {/* Question meta row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-primary/5 text-primary text-xs font-bold flex items-center justify-center">
                            {displayNum}
                          </span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            {question.type?.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {question.criterionId && (() => {
                            const crit = criteriaMap.get(question.criterionId);
                            const code = crit?.code || crit?.title || question.criterionId;
                            const desc = crit?.description || crit?.title;

                            return (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-semibold border-primary/20 bg-primary/10 text-primary"
                                title={desc}
                              >
                                Criterion: {code}
                              </Badge>
                            );
                          })()}
                          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-none">
                            {question.marks || 1}{" "}
                            {question.marks === 1 ? "Mark" : "Marks"}
                          </Badge>
                        </div>
                      </div>

                      {/* Prompt */}
                      {question.content && (
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                          {cleanHtmlText(question.content)}
                        </p>
                      )}

                      {/* Answer Key Display per type */}
                      <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct Answer / Solution:</span>
                        </div>

                        {/* MCQ */}
                        {question.type === "MCQ" && (
                          <div className="space-y-1.5 pt-1">
                            {Array.isArray(cfg.options) &&
                              cfg.options.map((opt: any, optIdx: number) => {
                                const isCorrect =
                                  optIdx === cfg.correctIndex ||
                                  (typeof opt === "object" && opt.isCorrect);
                                 const optText = cleanHtmlText(
                                   typeof opt === "string" ? opt : opt?.text || "",
                                 );

                                return (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
                                      isCorrect
                                        ? "border-emerald-300 bg-emerald-100/70 text-emerald-900 font-semibold"
                                        : "border-slate-200/70 bg-white/80 text-slate-600 opacity-65",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                                        isCorrect
                                          ? "bg-emerald-600 text-white"
                                          : "bg-slate-200 text-slate-700",
                                      )}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{optText}</span>
                                    {isCorrect && (
                                      <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {/* True / False */}
                        {question.type === "TRUE_FALSE" && (
                          <div className="flex items-center gap-2 pt-1">
                            {["True", "False"].map((choice, cIdx) => {
                              const isCorrect =
                                (cfg.correctIndex !== undefined &&
                                  cIdx === cfg.correctIndex) ||
                                cfg.correctAnswer ===
                                  (cIdx === 0 ? "TRUE" : "FALSE");
                              return (
                                <span
                                  key={choice}
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-semibold border",
                                    isCorrect
                                      ? "border-emerald-300 bg-emerald-100 text-emerald-900"
                                      : "border-slate-200 bg-white text-slate-500 opacity-60",
                                  )}
                                >
                                  {choice} {isCorrect ? "✓" : ""}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Gap Fill / Text Input */}
                        {(question.type === "GAP_FILL" ||
                          question.type === "GAP_MCQ" ||
                          question.type === "TEXT") && (
                          <div className="text-xs text-emerald-900 font-semibold">
                            {cfg.correctAnswers ? (
                              <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(cfg.correctAnswers) ? (
                                  cfg.correctAnswers.map((ans: string, aIdx: number) => (
                                    <span
                                      key={aIdx}
                                      className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 font-mono shadow-none"
                                    >
                                      {cleanHtmlText(ans)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 font-mono shadow-none">
                                    {cleanHtmlText(String(cfg.correctAnswers))}
                                  </span>
                                )}
                              </div>
                            ) : cfg.correctAnswer ? (
                              <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 font-mono shadow-none">
                                {cleanHtmlText(cfg.correctAnswer)}
                              </span>
                            ) : (
                              <span className="italic text-slate-500 font-normal">
                                Standard teacher evaluated response
                              </span>
                            )}
                          </div>
                        )}

                        {/* Matching */}
                        {question.type === "MATCHING" && (
                          <div className="space-y-1 pt-1 text-xs">
                            {Array.isArray(cfg.pairs) ? (
                              cfg.pairs.map((p: any, pIdx: number) => (
                                <div
                                  key={pIdx}
                                  className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-emerald-100"
                                >
                                  <span className="font-semibold text-slate-800">
                                    {cleanHtmlText(p.left || p.prompt)}
                                  </span>
                                  <span className="text-emerald-600 font-bold">
                                    ➔
                                  </span>
                                  <span className="font-bold text-emerald-900">
                                    {cleanHtmlText(p.right || p.answer)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="italic text-slate-500 font-normal">
                                Matching pairs defined
                              </span>
                            )}
                          </div>
                        )}

                        {/* Ordering */}
                        {question.type === "ORDERING" && (
                          <div className="space-y-1 pt-1 text-xs">
                            {Array.isArray(cfg.correctOrder || cfg.items) &&
                              (cfg.correctOrder || cfg.items).map(
                                (item: any, oIdx: number) => (
                                  <div
                                    key={oIdx}
                                    className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-emerald-100"
                                  >
                                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {oIdx + 1}
                                    </span>
                                    <span className="text-slate-800 font-medium">
                                      {cleanHtmlText(
                                        typeof item === "string"
                                          ? item
                                          : item?.text || "",
                                      )}
                                    </span>
                                  </div>
                                ),
                              )}
                          </div>
                        )}

                        {/* Generic fallback */}
                        {question.type !== "MCQ" &&
                          question.type !== "TRUE_FALSE" &&
                          question.type !== "GAP_FILL" &&
                          question.type !== "GAP_MCQ" &&
                          question.type !== "TEXT" &&
                          question.type !== "MATCHING" &&
                          question.type !== "ORDERING" && (
                            <p className="text-xs text-emerald-900 font-medium">
                              {cleanHtmlText(
                                cfg.correctAnswer ||
                                  cfg.answer ||
                                  JSON.stringify(cfg),
                              )}
                            </p>
                          )}

                        {/* Explanation */}
                        {question.explanation && (
                          <div className="pt-2 border-t border-emerald-100/80 text-[11px] text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-700">
                              Explanation:{" "}
                            </span>
                            {cleanHtmlText(question.explanation)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
