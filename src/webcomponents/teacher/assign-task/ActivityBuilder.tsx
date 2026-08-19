"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QuestionRenderer } from "@/webcomponents/sameroute/class/tasks/QuestinRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Send, Trash2, GripVertical, Save, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { createTask, getTaskById, updateTask } from "@/api/task/api";
import { 
  MCQConfigUI, 
  TrueFalseConfigUI, 
  GapFillConfigUI, 
  WordBoxMatchConfigUI, 
  MatchingConfigUI, 
  QuestionAnswerConfigUI, 
  OrderingConfigUI 
} from "./QuestionConfigs";

type QuestionType = "MCQ" | "GAP_FILL" | "WORD_BOX_MATCH" | "MATCHING" | "QUESTION_ANSWER" | "ORDERING" | "TRUE_FALSE";
type TaskType = "READING" | "GRAMMAR" | "VOCABULARY";

interface QuestionConfig {
  id: string;
  type: QuestionType;
  content: string;
  explanation?: string;
  config: any;
  marks?: number;
  isExpanded?: boolean;
}

const LOCAL_STORAGE_KEY = "esolmaster_activity_builder_draft";

const QuestionCard = React.memo(({ q, index, dragHandleProps, updateQuestion, removeQuestion }: any) => {
  const isExpanded = q.isExpanded !== false;

  return (
    <Card className="border-slate-100 shadow-none relative group bg-white overflow-hidden transition-all rounded-xl">
      <div 
        className="absolute left-2 top-3.5 cursor-grab text-slate-300 hover:text-slate-500 transition-colors z-10 opacity-0 group-hover:opacity-100"
        {...dragHandleProps}
      >
        <GripVertical size={18} />
      </div>
      <div className="pl-7">
        <CardHeader className="py-3 px-5 bg-slate-50/30 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-[13px] font-semibold text-slate-700 tracking-wide">
            {index + 1}. {q.type.replace(/_/g, " ")}
          </CardTitle>
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <div className="flex items-center gap-2 mr-2">
                <Label className="text-xs font-medium text-slate-500">Marks</Label>
                <Input 
                  type="number" 
                  min="0"
                  className="w-16 h-7 text-xs text-center px-1 py-0 bg-white" 
                  value={q.marks ?? 1} 
                  onChange={(e) => updateQuestion(q.id, { marks: parseInt(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <div className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                {q.marks ?? 1} {q.marks === 1 ? 'Mark' : 'Marks'}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button type="button" 
                variant="ghost" 
                size="sm" 
                className="text-slate-500 hover:text-slate-700 h-7 text-xs px-2" 
                onClick={() => updateQuestion(q.id, { isExpanded: !isExpanded })}
              >
                {isExpanded ? "Collapse" : "Edit"}
              </Button>
              <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 transition-colors" onClick={() => removeQuestion(q.id)}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded ? (
          <CardContent className="p-5 space-y-6">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-slate-700">Question Prompt</Label>
              <RichTextEditor 
                placeholder="Enter the question here..." 
                value={q.content}
                onChange={(val) => updateQuestion(q.id, { content: val })}
              />
            </div>
            
            <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-lg text-sm text-slate-500 font-medium">
              {q.type === "MCQ" && <MCQConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "TRUE_FALSE" && <TrueFalseConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "GAP_FILL" && <GapFillConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "WORD_BOX_MATCH" && <WordBoxMatchConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "MATCHING" && <MatchingConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "QUESTION_ANSWER" && <QuestionAnswerConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
              {q.type === "ORDERING" && <OrderingConfigUI config={q.config} onChange={(c) => updateQuestion(q.id, { config: c })} />}
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-medium text-slate-700">Explanation (Optional)</Label>
              <p className="text-xs text-slate-500">Provide an explanation for the correct answer. Students will see this after they submit.</p>
              <RichTextEditor 
                placeholder="Explain why the answer is correct..." 
                value={q.explanation || ""}
                onChange={(val) => updateQuestion(q.id, { explanation: val })}
              />
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-5 py-4 flex flex-col gap-3 min-w-0 overflow-hidden relative">
            <div 
              className="text-sm text-slate-800 prose prose-sm prose-slate max-w-none prose-p:my-0 w-full min-w-0 whitespace-pre-wrap break-words" 
              dangerouslySetInnerHTML={{ __html: (q.content || "<span class='text-slate-400 italic'>No prompt provided.</span>").replace(/&nbsp;/g, ' ') }} 
            />
            
            {(q.type === "MCQ" || q.type === "TRUE_FALSE" || q.type === "GAP_FILL") && q.config?.options && (
              <div className="flex flex-col gap-2 pl-2 w-full min-w-0">
                {q.config.options.map((optText: string, index: number) => {
                  const isCorrect = q.config.correctIndex === index;
                  return (
                    <div key={index} className={`flex items-center gap-2.5 text-sm px-3 py-1.5 rounded-md border ${isCorrect ? 'bg-emerald-50/50 text-emerald-800 border-emerald-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-slate-300'} shrink-0`} />
                      <span className="min-w-0 truncate">{optText || <span className="italic text-slate-400">Empty option</span>}</span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {q.type === "WORD_BOX_MATCH" && q.config?.sentences && (
              <div className="flex flex-col gap-2 pl-2 w-full min-w-0">
                {q.config.sentences.map((s: any, idx: number) => (
                  <div key={idx} className="text-sm px-3 py-2 rounded-md border bg-slate-50 border-slate-100 flex flex-col gap-1">
                    <div className="text-slate-600 italic">"{s.text}"</div>
                    <div className="text-emerald-700 font-medium">Answer: {s.answer}</div>
                  </div>
                ))}
              </div>
            )}

            {q.type === "MATCHING" && q.config?.leftItems && (
              <div className="flex flex-col gap-2 pl-2 w-full min-w-0">
                {q.config.leftItems.map((left: string, idx: number) => {
                  const rightIdx = q.config.matches ? q.config.matches[idx] : null;
                  const right = rightIdx !== null && rightIdx !== undefined ? q.config.rightItems[rightIdx] : "";
                  return (
                    <div key={idx} className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-md border bg-slate-50 border-slate-100">
                      <span className="text-slate-700 font-medium">{left}</span>
                      <span className="text-slate-400">-</span>
                      <span className="text-slate-600">{right}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {q.type === "ORDERING" && q.config?.items && (
              <div className="flex flex-col gap-1 pl-2 w-full min-w-0">
                {q.config.items.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {q.type === "QUESTION_ANSWER" && q.config?.answer && (
              <div className="text-sm px-3 py-2 rounded-md border bg-emerald-50/50 border-emerald-100 text-emerald-800 ml-2 font-medium">
                Answer: {q.config.answer}
              </div>
            )}

            {q.explanation && q.explanation !== "<p><br></p>" && (
              <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 mt-2 w-full min-w-0 overflow-hidden">
                <span className="font-semibold text-slate-900 mb-1.5 block">Explanation:</span>
                <div 
                  className="prose prose-sm prose-slate max-w-none prose-p:my-0 w-full min-w-0 whitespace-pre-wrap break-words" 
                  dangerouslySetInnerHTML={{ __html: q.explanation.replace(/&nbsp;/g, ' ') }} 
                />
              </div>
            )}
          </CardContent>
        )}
      </div>
    </Card>
  );
});

const LocalTaskPreview = ({ title, taskType, questions }: { title: string, taskType: string, questions: QuestionConfig[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  
  const meta = {
    grammar: { label: "Grammar", emoji: "📝", variant: "info" },
    reading: { label: "Reading", emoji: "📖", variant: "success" },
    vocabulary: { label: "Vocabulary", emoji: "💬", variant: "warning" },
  }[taskType.toLowerCase()] || { label: taskType, emoji: "📄", variant: "default" };

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-slate-500">No questions added yet to preview.</div>;
  }

  // Convert builder question config to the format QuestionRenderer expects
  const formatQuestion = (q: QuestionConfig) => {
    let baseConfig = q.config || {};
    return {
      id: q.id,
      type: q.type,
      config: { 
        question: q.content || "", 
        explanation: q.explanation || "", 
        marks: q.marks || 1, 
        options: [], 
        ...baseConfig 
      }
    };
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(c => c + 1);
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title || "Untitled Activity"}</h1>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 shadow-sm">
            <span>{meta.emoji}</span> {meta.label}
          </span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-100/80 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out" 
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-400 min-w-[3rem] text-right tracking-widest">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8">
        <QuestionRenderer 
          question={formatQuestion(currentQuestion) as any} 
          userAnswer={answers[currentQuestion.id]}
          setAnswer={(ans) => setAnswers(prev => ({...prev, [currentQuestion.id]: ans}))}
          submitted={submitted}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
        <Button 
          variant="outline" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="border-slate-200"
        >
          Previous
        </Button>
        
        {currentIndex < totalQuestions - 1 ? (
          <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
            Next
          </Button>
        ) : (
          <Button onClick={() => setSubmitted(true)} className="bg-emerald-600 hover:bg-emerald-700">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default function ActivityBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const taskId = searchParams.get("taskId");

  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("GRAMMAR");
  const [passingScore, setPassingScore] = useState<string>("80");
  const [readingPassage, setReadingPassage] = useState("");
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [initialQuestionIds, setInitialQuestionIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(!!taskId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (taskId) {
      getTaskById(taskId).then(task => {
        setTitle(task.title || "");
        setTaskType((task.type as TaskType) || "GRAMMAR");
        setPassingScore(task.passMark ? task.passMark.toString() : "80");
        setReadingPassage(task.content || "");
        if (task.questions) {
          const loadedQuestions = task.questions.map((q: any) => {
            let configObj = { question: "", prompt: "", explanation: "", marks: 1, data: undefined } as any;
            try { configObj = JSON.parse(q.config); } catch(e) {}
            
            const { question, prompt, explanation, marks, data, ...restConfig } = configObj;
            const contentStr = question || prompt || "";
            let extractedConfig = data || restConfig || {};

            // Legacy data sanitization so it doesn't crash the preview mode
            if (q.type === "TRUE_FALSE" && !extractedConfig.options) {
              extractedConfig.options = ["True", "False"];
              extractedConfig.correctIndex = extractedConfig.correctAnswer === "TRUE" ? 0 : 1;
            }

            if (q.type === "MATCHING" && extractedConfig.pairs && !extractedConfig.leftItems) {
              extractedConfig.leftItems = extractedConfig.pairs.map((p: any) => p?.left || "");
              extractedConfig.rightItems = extractedConfig.pairs.map((p: any) => p?.right || "");
              extractedConfig.matches = extractedConfig.pairs.reduce((acc: any, p: any, i: number) => {
                acc[i] = i;
                return acc;
              }, {});
            }

            if (extractedConfig.options && Array.isArray(extractedConfig.options)) {
              if (extractedConfig.correctIndex === undefined) {
                const legacyIdx = extractedConfig.options.findIndex((o: any) => o && typeof o === 'object' && o.isCorrect);
                if (legacyIdx !== -1) extractedConfig.correctIndex = legacyIdx;
              }
              extractedConfig.options = extractedConfig.options.map((opt: any) => typeof opt === 'string' ? opt : (opt?.text || ""));
            }
            if (extractedConfig.items && Array.isArray(extractedConfig.items)) {
              extractedConfig.items = extractedConfig.items.map((opt: any) => typeof opt === 'string' ? opt : (opt?.text || ""));
            }

            return {
              id: q.id,
              type: q.type,
              content: contentStr,
              explanation: explanation || "",
              marks: marks ?? 1,
              config: extractedConfig,
              isExpanded: false
            };
          });
          setQuestions(loadedQuestions);
          setInitialQuestionIds(loadedQuestions.map((q: any) => q.id));
        }
        setIsLoadingTask(false);
        setIsLoaded(true);
      }).catch(err => {
        toast.error("Failed to load task");
        setIsLoadingTask(false);
        setIsLoaded(true);
      });
    } else {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setQuestions(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load draft from localStorage", err);
      }
      setIsLoaded(true);
    }
  }, [taskId]);

  useEffect(() => {
    if (isLoaded && !taskId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
    }
  }, [questions, isLoaded, taskId]);

  const addQuestion = (type: QuestionType) => {
    setQuestions([...questions, {
      id: Math.random().toString(36).substring(7),
      type,
      content: "",
      explanation: "",
      marks: 1,
      config: {},
      isExpanded: true
    }]);
  };

  const removeQuestion = React.useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const updateQuestion = React.useCallback((id: string, updates: Partial<QuestionConfig>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const handleSave = async (status: "PUBLISHED" | "DRAFT", shouldRedirect = true) => {
    if (!title) {
      toast.error("Please enter a title for the activity.");
      return;
    }

    try {
      let response: any;
      if (taskId) {
        const deleteQuestionIds = initialQuestionIds.filter(id => !questions.some(q => q.id === id));
        const updateQuestions = questions.filter(q => initialQuestionIds.includes(q.id)).map((q, index) => ({
          id: q.id,
          type: q.type,
          order: index + 1,
          config: JSON.stringify({ question: q.content, explanation: q.explanation || "", marks: q.marks ?? 1, ...q.config })
        }));
        const newQuestions = questions.filter(q => !initialQuestionIds.includes(q.id)).map((q, index) => ({
          type: q.type,
          order: index + 1,
          config: JSON.stringify({ question: q.content, explanation: q.explanation || "", marks: q.marks ?? 1, ...q.config }),
          clientKey: q.id
        }));

        response = await updateTask(taskId, {
          title,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          folderId: folderId || undefined,
          content: readingPassage,
          deleteQuestionIds,
          updateQuestions,
          newQuestions,
        } as any);
      } else {
        const formattedQuestions = questions.map((q, index) => ({
          type: q.type,
          order: index + 1,
          config: JSON.stringify({ 
            question: q.content, 
            explanation: q.explanation || "", 
            marks: q.marks ?? 1,
            ...q.config 
          })
        }));

        response = await createTask({
          title,
          type: taskType,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          questions: formattedQuestions as any,
          folderId: folderId || undefined,
          content: readingPassage,
        } as any);
      }

      toast.success(`Activity saved as ${status}!`);
      if (status === "PUBLISHED" || status === "DRAFT") {
        if (!taskId) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      
      const currentTaskId = taskId || (response && response.id);

      if (shouldRedirect) {
        if (folderId) {
          router.push(`/content-library?folderId=${folderId}`);
        } else {
          router.push("/content-library");
        }
      } else {
        if (!taskId && response && response.id) {
          router.replace(`?taskId=${response.id}${folderId ? `&folderId=${folderId}` : ''}`);
        }
      }
      
      return currentTaskId;
    } catch (e) {
      toast.error("Failed to save activity to the server.");
      console.error(e);
      return null;
    }
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question to preview.");
      return;
    }
    setIsPreviewOpen(true);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
  };



  if (isLoadingTask) {
    return <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-8 flex flex-col gap-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{taskId ? "Edit Activity" : "Activity Builder"}</h1>
          <p className="text-sm text-slate-500 mt-1">{taskId ? "Update your assessment" : "Design an assessment with mixed question types."}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button type="button" variant="outline" className="font-medium border-slate-200 hover:bg-slate-50" onClick={() => handleSave("DRAFT", false)}>
            <Save className="w-4 h-4 mr-2 text-slate-500" />
            Save Draft
          </Button>
          <Button type="button" className="font-medium" onClick={() => handleSave("PUBLISHED")}>
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-9 flex flex-col gap-8">
          <Card className="border-slate-100 overflow-hidden shadow-none rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-5 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">Activity Settings</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSave("DRAFT", false)}
                className="h-8"
              >
                <Save className="w-3.5 h-3.5 mr-2" />
                Save
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="space-y-2.5 md:col-span-8">
                  <Label className="text-sm font-medium text-slate-700">Activity Title</Label>
                  <Textarea 
                    className="min-h-8 h-8 resize-none overflow-hidden focus-visible:ring-primary/20 border-slate-200 shadow-none py-1"
                    placeholder="e.g. Present Simple Test" 
                    value={title} 
                    onChange={(e) => {
                      setTitle(e.target.value);
                      e.target.style.height = '32px';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 56)}px`;
                    }} 
                    rows={1}
                  />
                </div>
                <div className="space-y-2.5 md:col-span-4">
                  <Label className="text-sm font-medium text-slate-700">Passing Score (%)</Label>
                  <Input 
                    className="focus-visible:ring-primary/20 border-slate-200 shadow-none"
                    type="number" 
                    value={passingScore} 
                    onChange={(e) => setPassingScore(e.target.value)} 
                  />
                </div>
              </div>

              {taskType === "READING" && (
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <Label className="text-sm font-medium text-slate-700">Reading Passage</Label>
                  <Textarea 
                    placeholder="Enter the reading passage here..." 
                    className="min-h-[150px] focus-visible:ring-primary/20 border-slate-200 shadow-none"
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold tracking-tight text-slate-800">Questions Canvas</h3>
            {questions.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <PlusCircle className="text-slate-300 w-7 h-7" />
                </div>
                <h4 className="text-slate-700 font-semibold mb-1.5">No questions added yet</h4>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Click on the question types in the palette on the right to start building this activity.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="flex flex-col"
                    >
                      {questions.map((q, index) => (
                        <Draggable key={q.id} draggableId={q.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`pb-3 ${snapshot.isDragging ? "opacity-90" : ""}`}
                            >
                              <QuestionCard 
                                q={q} 
                                index={index} 
                                dragHandleProps={provided.dragHandleProps} 
                                updateQuestion={updateQuestion} 
                                removeQuestion={removeQuestion} 
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        <div className="col-span-3 sticky top-6">
          <Card className="border-slate-100 shadow-none overflow-hidden rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3 px-5 pt-4">
              <CardTitle className="text-sm font-semibold text-slate-800">Question Palette</CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold text-slate-400 mb-1 uppercase tracking-widest">Add a question</p>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("MCQ")}>
                <div className="w-6 h-6 rounded bg-blue-50/50 text-blue-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-blue-100/50">M</div>
                <span className="font-medium text-slate-600">MCQ</span>
              </Button>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("GAP_FILL")}>
                <div className="w-6 h-6 rounded bg-emerald-50/50 text-emerald-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-emerald-100/50">G</div>
                <span className="font-medium text-slate-600">Fill in the Blanks</span>
              </Button>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("WORD_BOX_MATCH")}>
                <div className="w-6 h-6 rounded bg-purple-50/50 text-purple-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-purple-100/50">W</div>
                <span className="font-medium text-slate-600">Word Box Match</span>
              </Button>

              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("MATCHING")}>
                <div className="w-6 h-6 rounded bg-amber-50/50 text-amber-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-amber-100/50">M</div>
                <span className="font-medium text-slate-600">Matching</span>
              </Button>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("QUESTION_ANSWER")}>
                <div className="w-6 h-6 rounded bg-pink-50/50 text-pink-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-pink-100/50">Q</div>
                <span className="font-medium text-slate-600">Short Answer</span>
              </Button>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("ORDERING")}>
                <div className="w-6 h-6 rounded bg-indigo-50/50 text-indigo-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-indigo-100/50">O</div>
                <span className="font-medium text-slate-600">Ordering</span>
              </Button>
              
              <Button type="button" variant="outline" className="justify-start border-slate-100 shadow-none hover:border-slate-200 hover:bg-slate-50 transition-colors h-10 px-3" onClick={() => addQuestion("TRUE_FALSE")}>
                <div className="w-6 h-6 rounded bg-cyan-50/50 text-cyan-600 flex items-center justify-center mr-3 text-[11px] font-bold border border-cyan-100/50">T/F</div>
                <span className="font-medium text-slate-600">True / False</span>
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Preview</DialogTitle>
            <DialogDescription>Experience this activity exactly as your students will see it.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <LocalTaskPreview title={title} taskType={taskType} questions={questions} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
