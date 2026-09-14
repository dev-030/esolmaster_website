/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Lightbulb,
  ArrowRight,
  Circle,
} from "lucide-react";
import { AttemptResult } from "@/types/attempt";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";

/* ---------- per-type review bodies ---------- */

const ChoiceReview = ({ r }: { r: any }) => {
  const options: string[] = r.options ?? [];
  if (!options.length) return <TextReview r={r} />;

  return (
    <div className="ml-8 space-y-1.5">
      {options.map((opt, i) => {
        const isCorrect = i === r.correctIndex;
        const isUserWrong = i === r.userIndex && !r.correct;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
              isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
              isUserWrong && "border-destructive/30 bg-destructive/10 text-destructive",
              !isCorrect && !isUserWrong && "border-slate-200 bg-white text-slate-600",
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : isUserWrong ? (
              <XCircle className="w-4 h-4 shrink-0 text-destructive" />
            ) : (
              <Circle className="w-4 h-4 shrink-0 text-slate-300" />
            )}
            <span dangerouslySetInnerHTML={{ __html: (opt || "").replace(/&nbsp;/g, " ") }} />
            {isCorrect && (
              <Badge variant="success" className="ml-auto text-[10px]">
                Correct
              </Badge>
            )}
            {isUserWrong && (
              <Badge variant="destructive" className="ml-auto text-[10px]">
                Your pick
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TextReview = ({ r }: { r: any }) => {
  const accepted: string[] = r.acceptedAnswers ?? r.correctAnswers ?? [];
  return (
    <div className="ml-8 space-y-2 text-sm">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1">
          Your answer
        </p>
        <div
          className={cn(
            "rounded-md border px-3 py-1.5",
            r.correct
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          {r.userAnswer ? String(r.userAnswer) : "No answer"}
        </div>
      </div>
      {!r.correct && accepted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">
            Accepted answer{accepted.length > 1 ? "s" : ""}
          </p>
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-emerald-800">
            {accepted.join("  ·  ")}
          </div>
        </div>
      )}
    </div>
  );
};

const MatchingReview = ({ r }: { r: any }) => {
  const userPairs: any[] = r.userPairs ?? [];
  const correctPairs: any[] = r.correctPairs ?? [];

  return (
    <div className="ml-8 space-y-3 text-sm">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground">
          Your matches
        </p>
        {userPairs.length === 0 && (
          <p className="text-muted-foreground italic">No matches made</p>
        )}
        {userPairs.map((p, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1.5",
              p.correct
                ? "border-emerald-300 bg-emerald-50"
                : "border-destructive/30 bg-destructive/10",
            )}
          >
            {p.correct ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span className="font-medium">{p.left}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{p.right}</span>
          </div>
        ))}
      </div>

      {!r.correct && correctPairs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Correct matches
          </p>
          {correctPairs.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 text-emerald-800"
            >
              <span className="font-medium">{p.left}</span>
              <ArrowRight className="w-3.5 h-3.5" />
              <span>{p.right}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WordBoxReview = ({ r }: { r: any }) => {
  const sentences: any[] = r.sentences ?? [];
  const words: string[] = r.words ?? [];

  if (!sentences.length) return <TextReview r={r} />;

  return (
    <div className="ml-8 space-y-3 text-sm">
      {words.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {words.map((w, i) => (
            <span
              key={i}
              className="rounded-full border bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
            >
              {w}
            </span>
          ))}
        </div>
      )}
      {sentences.map((s, i) => (
        <div
          key={i}
          className={cn(
            "rounded-md border px-3 py-2 space-y-1",
            s.correct
              ? "border-emerald-300 bg-emerald-50"
              : "border-destructive/30 bg-destructive/10",
          )}
        >
          <div className="flex items-start gap-2">
            {s.correct ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            )}
            <span>{s.text}</span>
          </div>
          <div className="ml-6 flex flex-wrap gap-x-4 text-xs">
            <span className={s.correct ? "text-emerald-700" : "text-destructive"}>
              Your word: <b>{s.userAnswer || "—"}</b>
            </span>
            {!s.correct && (
              <span className="text-emerald-700">
                Correct: <b>{s.correctAnswer}</b>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const OrderingReview = ({ r }: { r: any }) => {
  const steps: any[] = r.steps ?? [];
  if (!steps.length) return <TextReview r={r} />;

  return (
    <div className="ml-8 space-y-1.5 text-sm">
      {steps.map((s, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5",
            s.correct
              ? "border-emerald-300 bg-emerald-50"
              : "border-destructive/30 bg-destructive/10",
          )}
        >
          <span className="w-5 h-5 shrink-0 rounded-full bg-white/70 text-xs font-bold flex items-center justify-center">
            {s.position}
          </span>
          {s.correct ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive shrink-0" />
          )}
          <span className="flex-1">{s.userItem || "—"}</span>
          {!s.correct && (
            <span className="text-xs text-emerald-700">
              should be: <b>{s.correctItem}</b>
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const renderBody = (r: any) => {
  const variant = r.variant ?? r.type;
  switch (variant) {
    case "choice":
    case "MCQ":
      return <ChoiceReview r={r} />;
    case "matching":
    case "MATCHING":
      return <MatchingReview r={r} />;
    case "word-box":
    case "WORD_BOX_MATCH":
      return <WordBoxReview r={r} />;
    case "ordering":
    case "ORDERING":
      return <OrderingReview r={r} />;
    case "GAP_FILL":
      return r.options?.length ? <ChoiceReview r={r} /> : <TextReview r={r} />;
    default:
      return <TextReview r={r} />;
  }
};

const TYPE_LABEL: Record<string, string> = {
  MCQ: "Multiple choice",
  GAP_FILL: "Gap fill",
  MATCHING: "Matching",
  WORD_BOX_MATCH: "Word box",
  QUESTION_ANSWER: "Short answer",
  ORDERING: "Ordering",
};

export const ResultScreen = ({ result }: { result: AttemptResult }) => {
  const { classId } = useParams<{ classId: string }>();
  const { score, total, percentage, results } = result;

  const grade =
    percentage >= 90
      ? { label: "Excellent!", variant: "success", barColor: "bg-emerald-500", emoji: "🏆" }
      : percentage >= 70
        ? { label: "Good Work!", variant: "info", barColor: "bg-primary", emoji: "👍" }
        : percentage >= 50
          ? { label: "Keep Practicing", variant: "warning", barColor: "bg-amber-500", emoji: "💪" }
          : { label: "Needs Review", variant: "destructive", barColor: "bg-destructive", emoji: "📖" };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="text-4xl">{grade.emoji}</div>
          <div>
            <p className="text-5xl font-black">{percentage}%</p>
            <Badge
              variant={grade.variant as "info" | "success" | "warning" | "destructive"}
              className="mt-2"
            >
              {grade.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {score} out of {total} marks
          </p>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={cn("h-full transition-all", grade.barColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* EXAM BREAKDOWN */}
      {(result as any).examBreakdown && (
        <Card
          className={
            (result as any).examBreakdown.isPassed
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-destructive/25 bg-destructive/5"
          }
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-bold">Exam Breakdown</p>
                <p className="text-sm text-muted-foreground">
                  Awarding Body:{" "}
                  <span className="font-medium text-foreground">
                    {(result as any).examBreakdown.awardingBody}
                  </span>
                </p>
              </div>
              <Badge
                variant={
                  (result as any).examBreakdown.isPassed ? ("success" as any) : "destructive"
                }
                className="text-base px-3 py-1"
              >
                {(result as any).examBreakdown.isPassed ? "PASSED" : "FAILED"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-y py-3">
              <div className="space-y-1">
                <p className="text-muted-foreground">Target Pass Mark</p>
                <p className="font-bold text-lg">
                  {(result as any).examBreakdown.passMarkRequired ?? "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Your Score</p>
                <p className="font-bold text-lg">{score}</p>
              </div>
            </div>

            {((result as any).examBreakdown.achievedCriteria?.length > 0 ||
              (result as any).examBreakdown.missingCriteria?.length > 0) && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold">Criteria Assessment</p>
                {(result as any).examBreakdown.achievedCriteria?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Achieved</p>
                    <div className="flex flex-wrap gap-2">
                      {(result as any).examBreakdown.achievedCriteria.map((crit: string) => (
                        <div
                          key={crit}
                          className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {crit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as any).examBreakdown.missingCriteria?.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Missing</p>
                    <div className="flex flex-wrap gap-2">
                      {(result as any).examBreakdown.missingCriteria.map((crit: string) => (
                        <div
                          key={crit}
                          className="inline-flex items-center rounded-md border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          {crit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* REVIEW */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Question Review
        </p>

        {results.map((r: any, index) => (
          <div
            key={r.questionId}
            className={cn(
              "rounded-xl border p-4 space-y-3",
              r.correct ? "border-emerald-200 bg-emerald-50/60" : "border-destructive/25 bg-destructive/5",
            )}
          >
            {/* HEADER */}
            <div className="flex items-start gap-3">
              {r.correct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </Badge>
                  {r.criterion && (
                    <Badge variant="info" className="text-[10px]">
                      {r.criterion.code}
                      {r.criterion.description ? ` · ${r.criterion.description}` : ""}
                    </Badge>
                  )}
                </div>
                <div
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: `${index + 1}. ${(r.question || "").replace(/&nbsp;/g, " ")}` }}
                />
              </div>
            </div>

            {/* TYPE-SPECIFIC BODY */}
            {renderBody(r)}

            {/* EXPLANATION */}
            {r.note && (
              <div className="ml-8 flex items-start gap-2 text-xs bg-background border rounded-lg p-2 text-muted-foreground">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div
                  className="flex-1 prose-xs"
                  dangerouslySetInnerHTML={{ __html: (r.note || "").replace(/&nbsp;/g, " ") }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between pt-2">
        <Link href={`/classes/${classId}/tasks`} className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to activities
        </Link>
      </div>
    </div>
  );
};
