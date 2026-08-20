"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionComponentProps, WordBoxMatchConfig } from "@/types/attempt";

type StudentSentence = {
  key: string;
  text: string;
};

const normalizeSentences = (
  sentences: Array<string | { id?: string; text: string }> | undefined,
): StudentSentence[] => {
  if (!Array.isArray(sentences)) return [];

  return sentences
    .map((sentence, index) => {
      if (typeof sentence === "string") {
        return {
          key: String(index),
          text: sentence,
        };
      }

      return {
        key: sentence.id ?? String(index),
        text: sentence.text,
      };
    })
    .filter((sentence) => sentence.text?.trim().length > 0);
};

export const WordBoxMatchQuestion = ({
  question,
  userAnswer,
  setAnswer,
  submitted,
}: QuestionComponentProps<WordBoxMatchConfig>) => {
  const words = Array.isArray(question.config.words)
    ? question.config.words.filter((word) => word?.trim().length > 0)
    : [];

  const sentences = normalizeSentences(question.config.sentences);
  const selectedAnswers: string[] = Array.isArray(userAnswer) ? userAnswer : [];

  const updateAnswer = (sentenceIndex: number, word: string) => {
    if (submitted) return;

    const nextAnswers = Array.from({ length: sentences.length }, (_, index) => {
      return selectedAnswers[index] ?? "";
    });

    nextAnswers[sentenceIndex] = word;
    setAnswer(nextAnswers);
  };

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      {question.config.question && (
        <div 
          className="text-base font-semibold leading-relaxed text-slate-900 prose prose-slate max-w-none prose-p:my-0 break-words"
          dangerouslySetInnerHTML={{ __html: (question.config.question).replace(/&nbsp;/g, ' ') }}
        />
      )}

      {/* Official Exam Word Box Frame */}
      {words.length > 0 && (
        <div className="border border-blue-200 bg-blue-50/25 rounded-xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3 pb-1.5 border-b border-blue-100 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              📦 <span className="text-slate-800">Word Box Options</span>
            </span>
            <span className="text-[10px] text-slate-500 font-normal">Match items using options below</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {words.map((word, wIdx) => {
              const letter = String.fromCharCode(65 + wIdx);
              return (
                <div 
                  key={`${word}-${wIdx}`} 
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {letter}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 select-none">{word}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Matching Items (Exam Rows with Dotted Leaders) */}
      <div className="space-y-3 pt-1">
        {sentences.map((sentence, index) => {
          const value = selectedAnswers[index] ?? "";
          const selectedIdx = words.findIndex((w) => w === value);
          const selectedLetter = selectedIdx >= 0 ? String.fromCharCode(65 + selectedIdx) : null;

          return (
            <div
              key={sentence.key}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-2xs"
            >
              {/* Item Label & Dotted Leader */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {sentence.text}
                </span>
                <div className="hidden sm:block flex-1 border-b-2 border-dotted border-slate-300 mx-2" />
              </div>

              {/* Selection Dropdown */}
              <div className="w-full sm:w-64 shrink-0">
                <Select
                  value={value}
                  onValueChange={(selectedWord) => {
                    if (!selectedWord) return;
                    updateAnswer(index, selectedWord);
                  }}
                  disabled={submitted || words.length === 0}
                >
                  <SelectTrigger className="w-full h-9.5 bg-slate-50 border-slate-200 text-xs font-medium focus:ring-blue-500/20 rounded-lg">
                    <SelectValue placeholder="Select from Word Box...">
                      {value && (
                        <span className="flex items-center gap-1.5 truncate">
                          {selectedLetter && (
                            <span className="font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">
                              {selectedLetter}
                            </span>
                          )}
                          <span className="truncate text-slate-900 font-semibold">{value}</span>
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {words.map((word, wIdx) => {
                      const letter = String.fromCharCode(65 + wIdx);
                      return (
                        <SelectItem key={`${word}-${wIdx}`} value={word} className="text-xs">
                          <span className="font-bold text-slate-800 mr-2">{letter}.</span> {word}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
