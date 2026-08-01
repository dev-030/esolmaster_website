"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

  const getAvailableWords = (sentenceIndex: number) => {
    const selectedByOthers = selectedAnswers.filter(
      (_, index) => index !== sentenceIndex,
    );

    return words.filter((word) => {
      const current = selectedAnswers[sentenceIndex];
      return word === current || !selectedByOthers.includes(word);
    });
  };

  const updateAnswer = (sentenceIndex: number, word: string) => {
    if (submitted) return;

    const nextAnswers = Array.from({ length: sentences.length }, (_, index) => {
      return selectedAnswers[index] ?? "";
    });

    nextAnswers[sentenceIndex] = word;
    setAnswer(nextAnswers);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-base font-medium leading-relaxed text-foreground">
          {question.config.question || "Choose the best word for each sentence."}
        </p>

        <div className="flex flex-wrap gap-2">
          {words.map((word) => (
            <Badge key={word} variant="outline" className="px-3 py-1">
              {word}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sentences.map((sentence, index) => {
          const value = selectedAnswers[index] ?? "";
          const availableWords = getAvailableWords(index);

          return (
            <div key={sentence.key} className="border rounded-lg p-3 space-y-2">
              <p className="text-sm text-foreground">{sentence.text}</p>

              <Select
                value={value}
                onValueChange={(selectedWord) => {
                  if (!selectedWord) return;
                  updateAnswer(index, selectedWord);
                }}
                disabled={submitted || availableWords.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a word" />
                </SelectTrigger>
                <SelectContent>
                  {availableWords.map((word) => (
                    <SelectItem key={word} value={word}>
                      {word}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
