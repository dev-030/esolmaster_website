import React, { useState, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, CheckCircle2, Circle, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface ConfigProps {
  config: any;
  onChange: (newConfig: any) => void;
}

// 1. MCQ
export function MCQConfigUI({ config, onChange }: ConfigProps) {
  const [items, setItems] = useState<{ id: string; text: string }[]>(() => {
    if (config?.options && Array.isArray(config.options)) {
      return config.options.map((opt: any) => ({ 
        id: Math.random().toString(36).substring(7), 
        text: typeof opt === 'string' ? opt : (opt?.text || "")
      }));
    }
    return [
      { id: "1", text: "" },
      { id: "2", text: "" },
      { id: "3", text: "" },
    ];
  });
  const [correctIndex, setCorrectIndex] = useState<number>(config?.correctIndex ?? 0);

  useEffect(() => {
    onChange({ options: items.map(i => i.text), correctIndex });
  }, [items, correctIndex]);

  const updateOption = (id: string, text: string) => setItems(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  const setCorrect = (index: number) => setCorrectIndex(index);
  const addOption = () => setItems(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "" }]);
  const removeOption = (index: number) => {
    if (items.length <= 2) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    if (correctIndex === index) setCorrectIndex(0);
    else if (correctIndex > index) setCorrectIndex(correctIndex - 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-600">
          Multiple Choice Options (Select the green circle for the correct answer)
        </Label>
      </div>
      <div className="space-y-2">
        {items.map((opt, index) => {
          const letter = String.fromCharCode(65 + index);
          const isCorrect = correctIndex === index;
          return (
            <div key={opt.id} className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setCorrect(index)} 
                title={isCorrect ? "Correct Answer" : "Mark as Correct"}
                className="shrink-0 transition-colors cursor-pointer"
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                )}
              </button>
              <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border ${isCorrect ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {letter}
              </span>
              <Input 
                className={`h-9 text-xs shadow-none focus-visible:ring-blue-400 ${isCorrect ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950 font-medium' : 'border-slate-200 bg-white'}`}
                placeholder={`Option ${letter} text...`} 
                value={opt.text} 
                onChange={(e) => updateOption(opt.id, e.target.value)}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-500 shrink-0 h-8 w-8" 
                onClick={() => removeOption(index)} 
                disabled={items.length <= 2}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-1 text-xs border-slate-200 bg-white hover:bg-slate-50" onClick={addOption}>
        <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Add Option ({String.fromCharCode(65 + items.length)})
      </Button>
    </div>
  );
}

// 2. True / False
export function TrueFalseConfigUI({ config, onChange }: ConfigProps) {
  const correctAnswer = config?.options?.[config?.correctIndex] === "FALSE" ? "FALSE" : "TRUE";

  const setAnswer = (ans: "TRUE" | "FALSE") => {
    onChange({ options: ["TRUE", "FALSE"], correctIndex: ans === "TRUE" ? 0 : 1 });
  };

  useEffect(() => {
    if (!config?.options) setAnswer(correctAnswer as "TRUE" | "FALSE");
  }, []);

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Correct Answer</Label>
      <div className="flex items-center gap-4">
        <Button type="button" variant={correctAnswer === "TRUE" ? "default" : "outline"} 
          className={correctAnswer === "TRUE" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-200"}
          onClick={() => setAnswer("TRUE")}
        >
          True
        </Button>
        <Button type="button" variant={correctAnswer === "FALSE" ? "default" : "outline"} 
          className={correctAnswer === "FALSE" ? "bg-red-600 hover:bg-red-700" : "border-slate-200"}
          onClick={() => setAnswer("FALSE")}
        >
          False
        </Button>
      </div>
    </div>
  );
}

// 3. Gap Fill
export function GapFillConfigUI({ config, onChange }: ConfigProps) {
  const [items, setItems] = useState<{ id: string; text: string }[]>(() => {
    if (config?.options && Array.isArray(config.options)) {
      return config.options.map((opt: any) => ({ 
        id: Math.random().toString(36).substring(7), 
        text: typeof opt === 'string' ? opt : (opt?.text || "")
      }));
    }
    return [{ id: "1", text: "" }, { id: "2", text: "" }];
  });
  const [correctIndex, setCorrectIndex] = useState<number>(config?.correctIndex ?? 0);

  useEffect(() => {
    onChange({ options: items.map(i => i.text), correctIndex });
  }, [items, correctIndex]);

  const updateOption = (id: string, text: string) => setItems(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  const setCorrect = (index: number) => setCorrectIndex(index);
  const addOption = () => setItems(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "" }]);
  const removeOption = (index: number) => {
    if (items.length <= 2) return;
    setItems(prev => prev.filter((_, i) => i !== index));
    if (correctIndex === index) setCorrectIndex(0);
    else if (correctIndex > index) setCorrectIndex(correctIndex - 1);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gap Options (Dropdown)</Label>
      <p className="text-xs text-slate-500 mb-2">Type <strong className="bg-slate-100 px-1 rounded text-slate-700">__</strong> (two underscores) in the question prompt above to represent the blank. Only ONE blank per question is supported.</p>
      <div className="space-y-2">
        {items.map((opt, index) => (
          <div key={opt.id} className="flex items-center gap-2">
            <button type="button" onClick={() => setCorrect(index)} className="shrink-0 transition-colors">
              {correctIndex === index ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-400" />}
            </button>
            <Input 
              className={`shadow-none focus-visible:ring-primary/20 ${correctIndex === index ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
              placeholder="Dropdown option..." value={opt.text} onChange={(e) => updateOption(opt.id, e.target.value)}
            />
            <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 shrink-0" onClick={() => removeOption(index)} disabled={items.length <= 2}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-2 text-xs border-slate-200" onClick={addOption}>
        <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Option
      </Button>
    </div>
  );
}

// 4. Word Box Match
export function WordBoxMatchConfigUI({ config, onChange }: ConfigProps) {
  const [sentences, setSentences] = useState<{ id: string; text: string; answer: string }[]>(() => {
    if (config?.sentences && Array.isArray(config.sentences)) {
      return config.sentences.map((s: any) => ({
        id: s.id || Math.random().toString(36).substring(7),
        text: s.text || "",
        answer: s.answer || ""
      }));
    }
    return [{ id: "1", text: "", answer: "" }];
  });
  
  const [words, setWords] = useState<{ id: string; word: string }[]>(() => {
    if (config?.words && Array.isArray(config.words)) {
      return config.words.map((w: string) => ({ id: Math.random().toString(36).substring(7), word: w }));
    }
    return [];
  });

  useEffect(() => {
    const outputSentences = sentences.map(s => ({ id: s.id, text: s.text, answer: s.answer }));
    const outputWords = Array.from(new Set([...sentences.map(s => s.answer), ...words.map(w => w.word)])).filter(w => w.trim() !== "");
    onChange({ sentences: outputSentences, words: outputWords });
  }, [sentences, words]);

  const addSentence = () => setSentences(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "", answer: "" }]);
  const removeSentence = (id: string) => {
    if (sentences.length <= 1) return;
    setSentences(prev => prev.filter(s => s.id !== id));
  };
  const updateSentence = (id: string, field: "text" | "answer", value: string) => {
    setSentences(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addWord = () => setWords(prev => [...prev, { id: Math.random().toString(36).substring(7), word: "" }]);
  const removeWord = (id: string) => setWords(prev => prev.filter(w => w.id !== id));
  const updateWord = (id: string, value: string) => setWords(prev => prev.map(w => w.id === id ? { ...w, word: value } : w));

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentences with Blanks</Label>
        <p className="text-xs text-slate-500 mb-2">Type your sentences. Use <strong className="bg-slate-100 px-1 rounded text-slate-700">__</strong> (two underscores) to represent the blank, and specify the correct answer for it.</p>
        <div className="space-y-2 relative">
          <div className="absolute left-3 top-4 bottom-4 w-px bg-slate-200 z-0"></div>
          {sentences.map((sentence, index) => (
            <div key={sentence.id} className="flex gap-2 relative z-10 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0 mt-1">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <Textarea 
                  className="shadow-none border-slate-200 focus-visible:ring-primary/20 min-h-[60px]"
                  placeholder="The quick brown __ jumps over the lazy dog."
                  value={sentence.text} onChange={(e) => updateSentence(sentence.id, "text", e.target.value)}
                />
                <Input 
                  className="shadow-none border-emerald-200 focus-visible:ring-emerald-500/20 bg-emerald-50/30 text-emerald-900"
                  placeholder="Correct Answer (e.g. fox)"
                  value={sentence.answer} onChange={(e) => updateSentence(sentence.id, "answer", e.target.value)}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 shrink-0 mt-1" onClick={() => removeSentence(sentence.id)} disabled={sentences.length <= 1}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2 text-xs border-slate-200 ml-9" onClick={addSentence}>
          <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Sentence
        </Button>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distractor Words (Optional)</Label>
        <p className="text-xs text-slate-500 mb-2">Add extra incorrect words to appear in the word bank to make the task harder.</p>
        <div className="grid grid-cols-2 gap-2">
          {words.map((w) => (
            <div key={w.id} className="flex items-center gap-1">
              <Input 
                className="shadow-none h-8 text-sm border-slate-200 focus-visible:ring-primary/20"
                placeholder="Distractor word..." value={w.word} onChange={(e) => updateWord(w.id, e.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => removeWord(w.id)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" className="mt-2 text-xs border-slate-200 h-8" onClick={addWord}>
          <PlusCircle className="w-3 h-3 mr-1.5" /> Add Distractor
        </Button>
      </div>
    </div>
  );
}

// 5. Matching
const PAIR_THEMES = [
  { stroke: "#3b82f6", bg: "bg-blue-500 text-white", border: "border-blue-300", light: "bg-blue-50 text-blue-700", ring: "ring-blue-400" },
  { stroke: "#6366f1", bg: "bg-indigo-500 text-white", border: "border-indigo-300", light: "bg-indigo-50 text-indigo-700", ring: "ring-indigo-400" },
  { stroke: "#0d9488", bg: "bg-teal-600 text-white", border: "border-teal-300", light: "bg-teal-50 text-teal-700", ring: "ring-teal-400" },
  { stroke: "#f59e0b", bg: "bg-amber-500 text-white", border: "border-amber-300", light: "bg-amber-50 text-amber-700", ring: "ring-amber-400" },
  { stroke: "#8b5cf6", bg: "bg-purple-500 text-white", border: "border-purple-300", light: "bg-purple-50 text-purple-700", ring: "ring-purple-400" },
  { stroke: "#e11d48", bg: "bg-rose-500 text-white", border: "border-rose-300", light: "bg-rose-50 text-rose-700", ring: "ring-rose-400" },
  { stroke: "#0284c7", bg: "bg-sky-500 text-white", border: "border-sky-300", light: "bg-sky-50 text-sky-700", ring: "ring-sky-400" },
];

export function MatchingConfigUI({ config, onChange }: ConfigProps) {
  const [leftItems, setLeftItems] = useState<{ id: string; text: string }[]>(() => {
    if (config?.leftItems && Array.isArray(config.leftItems) && config.leftItems.length > 0) {
      return config.leftItems.map((text: string) => ({ id: Math.random().toString(36).substring(7), text }));
    }
    if (config?.pairs && Array.isArray(config.pairs) && config.pairs.length > 0) {
      return config.pairs.map((p: any) => ({ id: Math.random().toString(36).substring(7), text: p.left || "" }));
    }
    return [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ];
  });

  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>(() => {
    if (config?.rightItems && Array.isArray(config.rightItems) && config.rightItems.length > 0) {
      return config.rightItems.map((text: string) => ({ id: Math.random().toString(36).substring(7), text }));
    }
    if (config?.pairs && Array.isArray(config.pairs) && config.pairs.length > 0) {
      return config.pairs.map((p: any) => ({ id: Math.random().toString(36).substring(7), text: p.right || "" }));
    }
    return [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ];
  });

  const [matches, setMatches] = useState<Record<number, number>>(() => {
    if (config?.matches && typeof config.matches === "object" && Object.keys(config.matches).length > 0) {
      const initial: Record<number, number> = {};
      Object.entries(config.matches).forEach(([k, v]) => {
        initial[Number(k)] = Number(v);
      });
      return initial;
    }
    return {};
  });

  const [activeLeftIdx, setActiveLeftIdx] = useState<number | null>(null);

  useEffect(() => {
    const outputLeft = leftItems.map(l => l.text);
    const outputRight = rightItems.map(r => r.text);
    const outputPairs = leftItems.map((l, idx) => {
      const rIdx = matches[idx] ?? idx;
      return { left: l.text, right: rightItems[rIdx]?.text || "" };
    });

    const serializedMatches: Record<string, number> = {};
    Object.entries(matches).forEach(([k, v]) => {
      serializedMatches[k] = v;
    });

    onChange({
      leftItems: outputLeft,
      rightItems: outputRight,
      matches: serializedMatches,
      pairs: outputPairs,
    });
  }, [leftItems, rightItems, matches]);

  const updateLeft = (id: string, text: string) => {
    setLeftItems(prev => prev.map(l => l.id === id ? { ...l, text } : l));
  };

  const updateRight = (id: string, text: string) => {
    setRightItems(prev => prev.map(r => r.id === id ? { ...r, text } : r));
  };

  const addPair = () => {
    setLeftItems(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "" }]);
    setRightItems(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "" }]);
  };

  const removePair = (index: number) => {
    if (leftItems.length <= 2) return;
    setLeftItems(prev => prev.filter((_, i) => i !== index));
    setRightItems(prev => prev.filter((_, i) => i !== index));
    setMatches(prev => {
      const nextMatches: Record<number, number> = {};
      let nextL = 0;
      Object.keys(prev).forEach((k) => {
        const l = Number(k);
        if (l !== index) {
          const r = prev[l];
          const newR = r > index ? r - 1 : r;
          nextMatches[nextL] = newR;
          nextL++;
        }
      });
      return nextMatches;
    });
    if (activeLeftIdx === index) setActiveLeftIdx(null);
  };

  const handleLeftAnchorClick = (lIdx: number) => {
    setActiveLeftIdx(prev => (prev === lIdx ? null : lIdx));
  };

  const handleRightAnchorClick = (rIdx: number) => {
    if (activeLeftIdx === null) {
      // Unlink if clicked when not in active selection mode
      const connectedL = getConnectedLeftIndex(rIdx);
      if (connectedL !== undefined) {
        setMatches(prev => {
          const next = { ...prev };
          delete next[connectedL];
          return next;
        });
      }
      return;
    }

    // Set connection from activeLeftIdx to this rIdx
    setMatches(prev => {
      const next: Record<number, number> = {};
      Object.entries(prev).forEach(([l, r]) => {
        if (Number(l) !== activeLeftIdx && r !== rIdx) {
          next[Number(l)] = r;
        }
      });
      next[activeLeftIdx] = rIdx;
      return next;
    });
    setActiveLeftIdx(null);
  };

  const getConnectedLeftIndex = (rIdx: number): number | undefined => {
    const entry = Object.entries(matches).find(([, r]) => r === rIdx);
    return entry ? Number(entry[0]) : undefined;
  };

  const rowHeight = 48; // px height per row
  const rowGap = 12; // px gap between rows

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Matching Pairs & Answer Key
        </Label>
        <span className="text-[11px] text-slate-500">
          Click an anchor to connect pairs
        </span>
      </div>

      {activeLeftIdx !== null && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
          <span>
            Connecting Left Item <strong className="underline">#{activeLeftIdx + 1}</strong> — Click an empty Right anchor to connect!
          </span>
          <button
            type="button"
            onClick={() => setActiveLeftIdx(null)}
            className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer ml-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Interactive Connecting Board */}
      <div className="relative border border-slate-200/80 bg-slate-50/25 rounded-xl p-4">
        {/* SVG Bezier Connection Strings Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
          <svg className="w-full h-full">
            {leftItems.map((_, lIdx) => {
              const rIdx = matches[lIdx];
              if (rIdx === undefined || rIdx >= rightItems.length) return null;
              const isSelected = activeLeftIdx === lIdx;

              // Estimated anchor Y positions
              const startY = 32 + lIdx * (rowHeight + rowGap) + rowHeight / 2;
              const endY = 32 + rIdx * (rowHeight + rowGap) + rowHeight / 2;

              return (
                <path
                  key={`line-${lIdx}-${rIdx}`}
                  d={`M calc(50% - 30px) ${startY} C calc(50% - 5px) ${startY}, calc(50% + 5px) ${endY}, calc(50% + 30px) ${endY}`}
                  fill="none"
                  stroke={isSelected ? "#2563eb" : "#94a3b8"}
                  strokeWidth={isSelected ? "2" : "1.5"}
                  strokeDasharray={isSelected ? "3,3" : "none"}
                  opacity={isSelected ? 1 : 0.75}
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-20">
          {/* Left Column (Terms) */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Left Terms</span>
              <span className="text-[10px] text-slate-400 font-normal">Connect Anchor</span>
            </div>

            <div className="space-y-3">
              {leftItems.map((left, lIdx) => {
                const isSelected = activeLeftIdx === lIdx;
                const isConnected = matches[lIdx] !== undefined;

                return (
                  <div
                    key={left.id}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border bg-white transition-all ${
                      isSelected ? "border-blue-400 ring-2 ring-blue-400/20 shadow-xs" : "border-slate-200 shadow-2xs"
                    }`}
                  >
                    {/* Left Order Number Circle Badge (Small & Subtle) */}
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 bg-slate-100 border border-slate-200 text-slate-600">
                      {lIdx + 1}
                    </span>

                    <Input
                      className="h-8 text-xs border-transparent focus-visible:ring-0 focus-visible:border-slate-300 shadow-none px-2 flex-1"
                      placeholder={`Term ${lIdx + 1}...`}
                      value={left.text}
                      onChange={(e) => updateLeft(left.id, e.target.value)}
                    />

                    {/* Left Anchor Button (Small Minimalist Connector Dot) */}
                    <button
                      type="button"
                      onClick={() => handleLeftAnchorClick(lIdx)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400/40 shadow-xs"
                          : isConnected
                            ? "border-blue-300 bg-blue-50/50 hover:bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                      title={`Click to connect Left #${lIdx + 1}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? "bg-blue-600 scale-125" : isConnected ? "bg-blue-500" : "bg-slate-300"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (Definitions / Matches) */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
              <span>Right Definitions</span>
              <span className="text-[10px] text-slate-400 font-normal">Matched Left #</span>
            </div>

            <div className="space-y-3">
              {rightItems.map((right, rIdx) => {
                const connectedLIdx = getConnectedLeftIndex(rIdx);
                const isConnected = connectedLIdx !== undefined;

                return (
                  <div
                    key={right.id}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-slate-300"
                  >
                    {/* Right Anchor Button (Small, empty until connected with left order number) */}
                    <button
                      type="button"
                      onClick={() => handleRightAnchorClick(rIdx)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                        isConnected
                          ? "bg-blue-50 border-blue-200 text-blue-700 shadow-2xs"
                          : "bg-white text-transparent border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                      } ${activeLeftIdx !== null ? "animate-pulse ring-2 ring-blue-400/30" : ""}`}
                      title={
                        activeLeftIdx !== null
                          ? `Click to connect with Left #${activeLeftIdx + 1}`
                          : isConnected
                            ? `Connected to Left #${(connectedLIdx ?? 0) + 1} (Click to unlink)`
                            : "Click to pair"
                      }
                    >
                      {isConnected ? (connectedLIdx ?? 0) + 1 : ""}
                    </button>

                    <Input
                      className="h-8 text-xs border-transparent focus-visible:ring-0 focus-visible:border-slate-300 shadow-none px-2 flex-1"
                      placeholder={`Definition ${rIdx + 1}...`}
                      value={right.text}
                      onChange={(e) => updateRight(right.id, e.target.value)}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0"
                      onClick={() => removePair(rIdx)}
                      disabled={leftItems.length <= 2}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
        onClick={addPair}
      >
        <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
        Add Matching Pair
      </Button>
    </div>
  );
}

// 6. Question Answer
export function QuestionAnswerConfigUI({ config, onChange }: ConfigProps) {
  const [answer, setAnswer] = useState(config?.answer || "");

  useEffect(() => {
    onChange({ answer });
  }, [answer]);

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exact Correct Answer</Label>
      <p className="text-xs text-slate-500 mb-2">Provide the exact text answer for automatic grading.</p>
      <Input 
        className="shadow-none border-slate-200 focus-visible:ring-primary/20 font-medium"
        placeholder="e.g. Color"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
    </div>
  );
}

// 7. Ordering
export function OrderingConfigUI({ config, onChange }: ConfigProps) {
  const droppableId = useId();
  const [items, setItems] = useState<{ id: string; text: string }[]>(() => {
    if (config?.items && Array.isArray(config.items)) {
      return config.items.map((i: any) => ({ 
        id: Math.random().toString(36).substring(7), 
        text: typeof i === 'string' ? i : (i?.text || "")
      }));
    }
    return [{ id: "1", text: "" }, { id: "2", text: "" }, { id: "3", text: "" }];
  });

  useEffect(() => {
    onChange({ items: items.map(i => i.text) });
  }, [items]);

  const updateItem = (id: string, text: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, text } : i));
  const addItem = () => setItems(prev => [...prev, { id: Math.random().toString(36).substring(7), text: "" }]);
  const removeItem = (id: string) => {
    if (items.length <= 2) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordered Items</Label>
      <p className="text-xs text-slate-500 mb-2">Input the items in their <strong>correct chronological/sequential order</strong>. Grab the handles to reorder. The system will automatically scramble them for the student.</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`flex items-center gap-2.5 p-1.5 rounded-xl border bg-white transition-all ${
                        snapshot.isDragging ? "border-blue-400 shadow-md ring-2 ring-blue-400/20 bg-blue-50/20 z-50" : "border-slate-200 shadow-2xs"
                      }`}
                    >
                      {/* Drag Grip Handle */}
                      <div
                        {...dragProvided.dragHandleProps}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing shrink-0"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Step Number Badge */}
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-600 shrink-0">
                        {index + 1}
                      </div>

                      <Input 
                        className="h-8 text-xs border-transparent focus-visible:ring-0 focus-visible:border-slate-300 shadow-none px-2 flex-1"
                        placeholder={`Step ${index + 1}...`}
                        value={item.text}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-red-500 shrink-0"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 2}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button type="button" variant="outline" size="sm" className="mt-2 text-xs border-slate-200 text-slate-700 hover:bg-slate-50" onClick={addItem}>
        <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Add Step
      </Button>
    </div>
  );
}
