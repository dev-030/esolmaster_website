"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetTaskWords } from "@/api/task";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ImageOff } from "lucide-react";
import Image from "next/image";

interface TaskWord {
  id: string;
  wordName: string;
  definition: string;
  imageUrl?: string;
}

const WordCard = ({ word }: { word: TaskWord }) => (
  <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden flex flex-col hover:border-slate-300 shadow-none transition-all duration-200">
    <div className="w-full h-28 bg-gray-50 overflow-hidden">
      {word.imageUrl ? (
        <Image
          src={word.imageUrl}
          alt={word.wordName}
          className="w-full h-full object-cover"
          height={112}
          width={112}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <ImageOff size={22} />
        </div>
      )}
    </div>
    <div className="p-3 flex flex-col gap-1.5">
      <span className="text-sm font-bold text-gray-900 leading-tight">
        {word.wordName}
      </span>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {word.definition}
      </p>
    </div>
  </div>
);

const SkeletonCard = ({ delay }: { delay: number }) => (
  <div
    className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-full h-28 bg-gray-100" />
    <div className="p-3 flex flex-col gap-2">
      <div className="h-3 bg-gray-100 rounded-full w-2/5" />
      <div className="h-3 bg-gray-100 rounded-full w-4/5" />
    </div>
  </div>
);

const EmptyState = ({ searched }: { searched: boolean }) => (
  <div className="flex flex-col items-center gap-3 py-14 text-gray-300">
    <BookOpen size={36} strokeWidth={1.4} />
    <p className="text-sm">
      {searched ? "No words match your search." : "No words added yet."}
    </p>
  </div>
);

export const TaskWordsList = () => {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const [search, setSearch] = useState("");

  const { data: words, isLoading } = useGetTaskWords(taskId ?? "", search);

  if (!taskId) return null;

  const hasResults = Array.isArray(words) && words.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
          <BookOpen size={16} strokeWidth={1.8} />
          <span>Vocabulary Words</span>
          {hasResults && (
            <span className="text-xs font-mono bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {words.length}
            </span>
          )}
        </div>

        <div className="relative w-52">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <Input
            placeholder="Search words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 60} />
          ))}
        </div>
      ) : hasResults ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {words.map((word: TaskWord) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      ) : (
        <EmptyState searched={search.length > 0} />
      )}
    </div>
  );
};