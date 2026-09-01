"use client";

import { axios } from "@/lib/axios";
import dynamic from "next/dynamic";
const PdfSnippingTool = dynamic(() => import("./PdfSnippingTool"), { ssr: false });
import { cropPdfContext } from "@/lib/pdfCropper";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QuestionRenderer } from "@/webcomponents/sameroute/class/tasks/QuestinRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Send, Trash2, GripVertical, Save, Eye, Award, CheckCircle2, AlertCircle, Sparkles, Folder, BookOpen, X, Loader2, ArrowLeft, ChevronRight, School, Scissors, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { createTask, getTaskById, updateTask } from "@/api/task/api";
import { useGetCriteria } from "@/api/criteria/criteria";
import { useGetFolders, useGetFolderById } from "@/api/folder";
import { 
  MCQConfigUI, 
  TrueFalseConfigUI, 
  GapFillConfigUI, 
  WordBoxMatchConfigUI, 
  MatchingConfigUI, 
  QuestionAnswerConfigUI, 
  OrderingConfigUI 
} from "./QuestionConfigs";
import { LocalTaskPreview } from "./LocalTaskPreview";

type QuestionType = "MCQ" | "GAP_FILL" | "WORD_BOX_MATCH" | "MATCHING" | "QUESTION_ANSWER" | "ORDERING" | "TRUE_FALSE" | "INSTRUCTION";
type TaskType = "READING" | "WRITING" | "LISTENING" | "SPEAKING" | "GRAMMAR" | "VOCABULARY";
type AwardingBodyType = "ASCENTIS" | "ESB" | "GATEWAY" | "TRINITY" | "CUSTOM";
type EntryLevelType = "ENTRY1" | "ENTRY2" | "ENTRY3" | "LEVEL1" | "LEVEL2";

// Official UK ESOL 20-Paper Matrix Pass Mark Definitions
export const UK_ESOL_MATRIX: Record<string, Record<string, { passMark: number; totalMarks: number; defaultPassPercentage: number; passLogic: string; note: string }>> = {
  ASCENTIS: {
    ENTRY1: { passMark: 18, totalMarks: 24, defaultPassPercentage: 75, passLogic: "CRITERIA_AND_SCORE", note: "Pass: 18 of 24 (75%) + Must cover every skill criterion" },
    ENTRY2: { passMark: 14, totalMarks: 21, defaultPassPercentage: 67, passLogic: "CRITERIA_AND_SCORE", note: "Pass: 14 of 21 (67%) + Must cover every skill criterion" },
    ENTRY3: { passMark: 14, totalMarks: 21, defaultPassPercentage: 67, passLogic: "CRITERIA_AND_SCORE", note: "Pass: 14 of 21 (67%) + Must cover every skill criterion" },
    LEVEL1: { passMark: 12, totalMarks: 18, defaultPassPercentage: 67, passLogic: "CRITERIA_AND_SCORE", note: "Pass: 12 of 18 (67%) + Must cover every skill criterion" },
    LEVEL2: { passMark: 14, totalMarks: 21, defaultPassPercentage: 67, passLogic: "CRITERIA_AND_SCORE", note: "Pass: 14 of 21 (67%) + Must cover every skill criterion" },
  },
  ESB: {
    ENTRY1: { passMark: 0, totalMarks: 16, defaultPassPercentage: 0, passLogic: "CRITERIA_ONLY", note: "No pass mark. Learner must achieve all criteria on the checklist." },
    ENTRY2: { passMark: 0, totalMarks: 16, defaultPassPercentage: 0, passLogic: "CRITERIA_ONLY", note: "No pass mark. Learner must achieve all criteria on the checklist." },
    ENTRY3: { passMark: 0, totalMarks: 16, defaultPassPercentage: 0, passLogic: "CRITERIA_ONLY", note: "No pass mark. Learner must achieve all criteria on the checklist." },
    LEVEL1: { passMark: 0, totalMarks: 16, defaultPassPercentage: 0, passLogic: "CRITERIA_ONLY", note: "No pass mark. Learner must achieve all criteria on the checklist." },
    LEVEL2: { passMark: 0, totalMarks: 16, defaultPassPercentage: 0, passLogic: "CRITERIA_ONLY", note: "No pass mark. Learner must achieve all criteria on the checklist." },
  },
  GATEWAY: {
    ENTRY1: { passMark: 13, totalMarks: 20, defaultPassPercentage: 65, passLogic: "SCORE_ONLY", note: "Pass: 13 of 20 (65%) — Marks alone" },
    ENTRY2: { passMark: 15, totalMarks: 24, defaultPassPercentage: 63, passLogic: "SCORE_ONLY", note: "Pass: 15 of 24 (63%) — Marks alone" },
    ENTRY3: { passMark: 17, totalMarks: 26, defaultPassPercentage: 65, passLogic: "SCORE_ONLY", note: "Pass: 17 of 26 (65%) — Marks alone" },
    LEVEL1: { passMark: 26, totalMarks: 40, defaultPassPercentage: 65, passLogic: "SCORE_ONLY", note: "Pass: 26 of 40 (65%) — Marks alone" },
    LEVEL2: { passMark: 26, totalMarks: 40, defaultPassPercentage: 65, passLogic: "SCORE_ONLY", note: "Pass: 26 of 40 (65%) — Marks alone" },
  },
  TRINITY: {
    ENTRY1: { passMark: 16, totalMarks: 24, defaultPassPercentage: 67, passLogic: "SCORE_ONLY", note: "Pass: 16 of 24 (67%) — Marks alone" },
    ENTRY2: { passMark: 16, totalMarks: 24, defaultPassPercentage: 67, passLogic: "SCORE_ONLY", note: "Pass: 16 of 24 (67%) — Marks alone" },
    ENTRY3: { passMark: 18, totalMarks: 27, defaultPassPercentage: 67, passLogic: "SCORE_ONLY", note: "Pass: 18 of 27 (67%) — Marks alone" },
    LEVEL1: { passMark: 20, totalMarks: 30, defaultPassPercentage: 67, passLogic: "SCORE_ONLY", note: "Pass: 20 of 30 (67%) — Marks alone" },
    LEVEL2: { passMark: 20, totalMarks: 30, defaultPassPercentage: 67, passLogic: "SCORE_ONLY", note: "Pass: 20 of 30 (67%) — Marks alone" },
  },
};

export interface TaskSection {
  id: string;
  title: string;
  instruction: string;
  questionHeading?: string;
  questionInstruction?: string;
  stimulusType: "IMAGE" | "RICH_TEXT";
  imageUrl?: string;
  content?: string;
}

interface QuestionConfig {
  id: string;
  sectionId?: string;
  type: QuestionType;
  content: string;
  explanation?: string;
  criterionId?: string;
  config: any;
  marks?: number;
  isExpanded?: boolean;
}

const LOCAL_STORAGE_KEY = "esolmaster_activity_builder_draft";

const QuestionCard = React.memo(({ q, index, questionNumber, dragHandleProps, updateQuestion, removeQuestion, criteriaList, isInvalid, errorMsg }: any) => {
  const isExpanded = q.isExpanded !== false;
  const currentCriterion = criteriaList?.find((c: any) => c.id === q.criterionId);

  return (
    <Card 
      id={`card-${q.id}`} 
      className={cn(
        "shadow-none relative group bg-white overflow-hidden transition-all rounded-xl",
        isInvalid ? "border-red-400 ring-2 ring-red-400/20 shadow-xs" : "border-slate-200 hover:border-slate-300"
      )}
    >
      {isInvalid && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 font-semibold flex items-center gap-1.5 animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg || "This question is incomplete or contains invalid fields."}</span>
        </div>
      )}
      <div 
        className="absolute left-2 top-3.5 cursor-grab text-slate-300 hover:text-slate-500 transition-colors z-10 opacity-0 group-hover:opacity-100"
        {...dragHandleProps}
      >
        <GripVertical size={18} />
      </div>
      <div className="pl-7">
        <CardHeader className="py-2.5 px-4 bg-slate-50/30 border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-[13px] font-semibold text-slate-700 tracking-wide">
              {q.type === "INSTRUCTION" ? "Instruction Line" : `${questionNumber ?? (index + 1)}. ${q.type.replace(/_/g, " ")}`}
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            {q.type !== "INSTRUCTION" && (
              isExpanded ? (
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
              )
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
              <Button type="button" variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 transition-colors cursor-pointer" onClick={() => removeQuestion(q.id)}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded ? (
          q.type === "INSTRUCTION" ? (
            <CardContent className="p-3.5 space-y-1.5">
              <Input 
                value={q.content ?? q.config?.heading ?? ""} 
                onChange={(e) => {
                  const val = e.target.value;
                  updateQuestion(q.id, { content: val, config: { ...q.config, heading: val } });
                }}
                placeholder="e.g. Questions 1–8: Choose the correct answer."
                className="h-8 text-xs bg-white border-slate-200 font-medium text-slate-800 focus-visible:ring-blue-400"
              />
            </CardContent>
          ) : (
            <CardContent className="p-5 space-y-6">
              <div className="space-y-2.5">
                <Label className="text-sm font-medium text-slate-700">Question Prompt</Label>
                <RichTextEditor 
                  placeholder="Enter the question or task instruction here..." 
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
                <Label className="text-sm font-medium text-slate-700">Explanation & Teacher Notes (Optional)</Label>
                <p className="text-xs text-slate-500">Provide an explanation or feedback for learners after they complete this question.</p>
                <RichTextEditor 
                  placeholder="Explain why the answer is correct or give feedback..." 
                  value={q.explanation || ""}
                  onChange={(val) => updateQuestion(q.id, { explanation: val })}
                />
              </div>
            </CardContent>
          )
        ) : (
          q.type === "INSTRUCTION" ? (
            <CardContent className="px-4 py-2.5 bg-slate-50/30 flex items-center border-t border-slate-100">
              <p className="text-xs font-medium text-slate-800 truncate">
                {q.content || q.config?.heading || <span className="text-slate-400 italic">No instruction text provided.</span>}
              </p>
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
            </CardContent>
          )
        )}
      </div>
    </Card>
  );
});

export default function ActivityBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const taskId = searchParams.get("taskId");

  // Fetch criteria & folder details from backend
  const { data: criteriaData } = useGetCriteria();
  const criteriaList = criteriaData?.data || [];
  const { data: allFoldersData } = useGetFolders(undefined);
  const rootFolders = allFoldersData || [];
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(folderId || undefined);
  const { data: currentFolder } = useGetFolderById(selectedFolderId || folderId || "");

  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("READING");
  const [customSkillName, setCustomSkillName] = useState<string>("");
  const [awardingBody, setAwardingBody] = useState<AwardingBodyType>("ASCENTIS");
  const [entryLevel, setEntryLevel] = useState<EntryLevelType>("ENTRY1");
  const [passingScore, setPassingScore] = useState<string>("75");
  const [mustPassAllSkills, setMustPassAllSkills] = useState(true);
  
  // Multi-Task Sections state
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [initialQuestionIds, setInitialQuestionIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(!!taskId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  const [isImporting, setIsImporting] = useState(false);
  const [pdfFileForSnipping, setPdfFileForSnipping] = useState<File | null>(null);
  const [showSnippingOverlay, setShowSnippingOverlay] = useState(false);
  const [snippedImages, setSnippedImages] = useState<string[]>([]);
  const [importProgressText, setImportProgressText] = useState("Analyzing PDF...");
  

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setPdfFileForSnipping(file);
    }

    let messageInterval: NodeJS.Timeout | undefined;

    try {
      setIsImporting(true);
      setImportProgressText("Uploading document...");

      let messageIndex = 0;
      const messages = [
        "AI is processing your document...",
        "Analyzing document layout...",
        "Extracting questions...",
        "Finalizing questions...",
        "Almost done..."
      ];
      messageInterval = setInterval(() => {
        setImportProgressText(messages[messageIndex]);
        messageIndex = Math.min(messageIndex + 1, messages.length - 1);
      }, 4000);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post('/tasks/import-pdf', formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000 // 5 min max — handles all 3 AI tiers completing
      });

      if (data.sections?.length > 0) {
        setImportProgressText("Rendering high-resolution context crops...");
        const processedSections = await Promise.all(
          data.sections.map(async (s: any) => {
            let imageUrl = s.imageUrl || "";
            if (!imageUrl && s.contextRegions && s.contextRegions.length > 0) {
              try {
                imageUrl = await cropPdfContext(file, s.contextRegions[0], 2.5);
              } catch (cropErr) {
                console.warn(`[Client Crop] Failed to crop section "${s.title}":`, cropErr);
              }
            }
            return {
              ...s,
              imageUrl,
              stimulusType: imageUrl ? "IMAGE" : (s.stimulusType || "IMAGE")
            };
          })
        );
        const generatedImages = processedSections
          .map((s: any) => s.imageUrl)
          .filter(Boolean);
        if (generatedImages.length > 0) {
          setSnippedImages(prev => Array.from(new Set([...prev, ...generatedImages])));
        }
        setTaskSections(prev => [...prev.filter(s => s.title !== ""), ...processedSections]);
      }
      if (data.questions?.length > 0) {
        setQuestions(prev => [...prev, ...data.questions]);
      }

      toast.success("Document analyzed and context crops generated!");
      playSuccessSound();
    } catch (e) {
      console.error(e);
      toast.error("Failed to import document. Please try again.");
    } finally {
      clearInterval(messageInterval);
      setIsImporting(false);
      // Reset input so the same file can be selected again
      if (e.target) {
        e.target.value = '';
      }
    }
  };


  // Auto-set Matrix defaults when Board or Level change
  const currentMatrixConfig = UK_ESOL_MATRIX[awardingBody]?.[entryLevel];

  const handleBoardOrLevelChange = (newBoard: AwardingBodyType, newLevel: EntryLevelType) => {
    setAwardingBody(newBoard);
    setEntryLevel(newLevel);
    const matrixInfo = UK_ESOL_MATRIX[newBoard]?.[newLevel];
    if (matrixInfo) {
      setPassingScore(matrixInfo.defaultPassPercentage.toString());
      setMustPassAllSkills(matrixInfo.passLogic === "CRITERIA_ONLY" || matrixInfo.passLogic === "CRITERIA_AND_SCORE");
    }
  };

  // Automatically infer Board and Level from folder context (e.g. Ascentis > Entry 1)
  useEffect(() => {
    if (currentFolder && !taskId) {
      const levelMap: Record<string, EntryLevelType> = {
        "Entry 1": "ENTRY1",
        "Entry 2": "ENTRY2",
        "Entry 3": "ENTRY3",
        "Level 1": "LEVEL1",
        "Level 2": "LEVEL2",
      };
      const boardMap: Record<string, AwardingBodyType> = {
        "Ascentis": "ASCENTIS",
        "ESB": "ESB",
        "Gateway": "GATEWAY",
        "Trinity": "TRINITY",
      };

      const matchedLevel = levelMap[currentFolder.name] || (currentFolder.ancestors?.[0] && levelMap[currentFolder.ancestors[0].name]);
      const matchedBoard = (currentFolder.ancestors?.[0] && boardMap[currentFolder.ancestors[0].name]) || boardMap[currentFolder.name];

      let targetBoard = awardingBody;
      let targetLevel = entryLevel;

      if (matchedLevel) {
        setEntryLevel(matchedLevel);
        targetLevel = matchedLevel;
      }
      if (matchedBoard) {
        setAwardingBody(matchedBoard);
        targetBoard = matchedBoard;
      }

      const matrixInfo = UK_ESOL_MATRIX[targetBoard]?.[targetLevel];
      if (matrixInfo) {
        setPassingScore(matrixInfo.defaultPassPercentage.toString());
        setMustPassAllSkills(matrixInfo.passLogic === "CRITERIA_ONLY" || matrixInfo.passLogic === "CRITERIA_AND_SCORE");
      }
    }
  }, [currentFolder, taskId]);

  useEffect(() => {
    if (taskId) {
      setIsLoaded(false);
      setIsLoadingTask(true);
      getTaskById(taskId).then(task => {
        setTitle(task.title || "");
        setTaskType((task.type as TaskType) || "READING");
        setPassingScore(task.passMark !== null && task.passMark !== undefined ? task.passMark.toString() : "75");
        if (task.readingContent?.passLogic) {
          setMustPassAllSkills(task.readingContent.passLogic === "CRITERIA_ONLY" || task.readingContent.passLogic === "CRITERIA_AND_SCORE");
        }
        
        // Parse multi-task sections or fallback to legacy single passage
        let loadedSections: TaskSection[] = [];
        if (task.content) {
          try {
            const parsed = JSON.parse(task.content);
            if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
              loadedSections = parsed.sections;
            }
          } catch (e) {
            // Legacy single string content
            loadedSections = [{
              id: "sec_1",
              title: "Task 1",
              instruction: "Read the text and answer the questions below.",
              stimulusType: task.readingContent?.imageUrl ? "IMAGE" : "RICH_TEXT",
              imageUrl: task.readingContent?.imageUrl || "",
              content: task.content || ""
            }];
          }
        }
        if (loadedSections.length === 0) {
          loadedSections = [{
            id: "sec_1",
            title: "Task 1",
            instruction: "Read the text and answer the questions below.",
            stimulusType: task.readingContent?.imageUrl ? "IMAGE" : "RICH_TEXT",
            imageUrl: task.readingContent?.imageUrl || "",
            content: task.content || ""
          }];
        }
        setTaskSections(loadedSections);

        if (task.folderId) {
          setSelectedFolderId(task.folderId);
        }
        if (task.readingContent?.awardingBody) {
          setAwardingBody(task.readingContent.awardingBody as AwardingBodyType);
        }
        if (task.readingContent?.entryType?.[0]) {
          setEntryLevel(task.readingContent.entryType[0] as EntryLevelType);
        }
        if (task.questions) {
          const loadedQuestions = task.questions.map((q: any) => {
            let configObj = { question: "", prompt: "", explanation: "", marks: 1, data: undefined, sectionId: undefined } as any;
            try { configObj = JSON.parse(q.config); } catch(e) {}
            
            const { question, prompt, explanation, marks, data, sectionId, ...restConfig } = configObj;
            const contentStr = question || prompt || "";
            let extractedConfig = data || restConfig || {};

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
              sectionId: sectionId || loadedSections[0]?.id || "sec_1",
              type: q.type,
              content: contentStr,
              explanation: explanation || "",
              criterionId: q.criterionId || undefined,
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
      setIsLoaded(true);
    }
  }, [taskId]);

  // Clean up any temporary local cache when unmounting / navigating away
  useEffect(() => {
    return () => {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (err) {
        console.error("Failed to clear draft on unmount", err);
      }
    };
  }, []);

  const addTaskSection = () => {
    const nextNum = taskSections.length + 1;
    const newSection: TaskSection = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `Task ${nextNum}`,
      instruction: "",
      questionHeading: "",
      questionInstruction: "",
      stimulusType: "IMAGE",
      imageUrl: "",
      content: ""
    };
    setTaskSections(prev => [...prev, newSection]);
    toast.success(`Task ${nextNum} Section created!`);
  };

  const updateTaskSection = (id: string, updates: Partial<TaskSection>) => {
    setTaskSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeTaskSection = (id: string) => {
    const remaining = taskSections.filter(s => s.id !== id);
    const fallbackId = remaining[0]?.id;
    if (fallbackId) {
      setQuestions(prev => prev.map(q => (q.sectionId === id ? { ...q, sectionId: fallbackId } : q)));
    } else {
      setQuestions(prev => prev.map(q => (q.sectionId === id ? { ...q, sectionId: undefined } : q)));
    }
    setTaskSections(remaining);
    toast.success("Task section deleted.");
  };

  const addQuestion = (type: QuestionType, targetSectionId?: string) => {
    let sectionId = targetSectionId;
    if (!sectionId) {
      if (taskSections.length === 0) {
        const newSec: TaskSection = {
          id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: "Task 1",
          instruction: "",
          stimulusType: "IMAGE",
          imageUrl: "",
          content: ""
        };
        setTaskSections([newSec]);
        sectionId = newSec.id;
      } else {
        sectionId = taskSections[taskSections.length - 1].id;
      }
    }
    if (type === "INSTRUCTION") {
      setQuestions(prev => [...prev, {
        id: Math.random().toString(36).substring(7),
        sectionId,
        type: "INSTRUCTION",
        content: "",
        explanation: "",
        marks: 0,
        config: {},
        isExpanded: true
      }]);
      return;
    }

    setQuestions(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      sectionId,
      type,
      content: "",
      explanation: "",
      marks: 1,
      config: {},
      isExpanded: true
    }]);
  };

  const [invalidFieldKeys, setInvalidFieldKeys] = useState<Record<string, any>>({});

  const removeQuestion = React.useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setInvalidFieldKeys(prev => {
      if (prev[`q_${id}`]) {
        const next = { ...prev };
        delete next[`q_${id}`];
        delete next[`q_${id}_msg`];
        return next;
      }
      return prev;
    });
  }, []);

  const updateQuestion = React.useCallback((id: string, updates: Partial<QuestionConfig>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
    setInvalidFieldKeys(prev => {
      if (prev[`q_${id}`]) {
        const next = { ...prev };
        delete next[`q_${id}`];
        delete next[`q_${id}_msg`];
        return next;
      }
      return prev;
    });
  }, []);

  const validateActivity = (): { firstError: string; errorMap: Record<string, any>; firstElementId?: string } | null => {
    const errors: Record<string, any> = {};
    let firstError: string | null = null;
    let firstElementId: string | undefined;

    if (!title || !title.trim()) {
      errors.title = true;
      if (!firstError) {
        firstError = "Please enter an Activity Title.";
        firstElementId = "field-title";
      }
    }

    if (!taskType) {
      errors.taskType = true;
      if (!firstError) {
        firstError = "Please select a Primary Skill Area.";
        firstElementId = "field-taskType";
      }
    }

    if (!entryLevel) {
      errors.entryLevel = true;
      if (!firstError) {
        firstError = "Please select an Entry Level.";
        firstElementId = "field-entryLevel";
      }
    }

    if (!taskSections || taskSections.length === 0) {
      errors.taskSections = true;
      if (!firstError) {
        firstError = "Please create at least one Task section.";
        firstElementId = "field-taskSections";
      }
    }

    if (!questions || questions.length === 0) {
      errors.questions = true;
      if (!firstError) {
        firstError = "Please add at least one question to the activity before saving.";
        firstElementId = "field-add-questions";
      }
    }

    // Validate each question item
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = i + 1;
      const qKey = `q_${q.id}`;

      if (q.type === "INSTRUCTION") {
        if (!q.content || !q.content.trim()) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Instruction text cannot be blank.";
          if (!firstError) {
            firstError = `Item ${qNum} (Instruction Line) is empty. Please enter instructions or remove it.`;
            firstElementId = `card-${q.id}`;
          }
        }
        continue;
      }

      if (q.type === "MCQ") {
        const options = q.config?.options;
        if (!Array.isArray(options) || options.length < 2) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Multiple Choice requires at least 2 options.";
          if (!firstError) {
            firstError = `Question ${qNum} (MCQ) requires at least 2 options.`;
            firstElementId = `card-${q.id}`;
          }
        } else if (options.some((opt: any) => !(typeof opt === "string" ? opt : opt?.text)?.trim())) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "One or more options are blank. Fill in all options or remove empty ones.";
          if (!firstError) {
            firstError = `Question ${qNum} (MCQ) has blank options. Please fill in all options or remove empty ones.`;
            firstElementId = `card-${q.id}`;
          }
        }
      } else if (q.type === "GAP_FILL") {
        const options = q.config?.options;
        if (!q.content || !q.content.trim()) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Question prompt/sentence is required.";
          if (!firstError) {
            firstError = `Question ${qNum} (Gap Fill) requires a prompt sentence.`;
            firstElementId = `card-${q.id}`;
          }
        } else if (Array.isArray(options) && options.some((opt: any) => !(typeof opt === "string" ? opt : opt?.text)?.trim())) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Option choices cannot be blank.";
          if (!firstError) {
            firstError = `Question ${qNum} (Gap Fill) has blank option choices.`;
            firstElementId = `card-${q.id}`;
          }
        }
      } else if (q.type === "WORD_BOX_MATCH") {
        const words = q.config?.words;
        const sentences = q.config?.sentences;
        if (!Array.isArray(words) || words.length === 0 || words.some((w: any) => !w?.trim())) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Word Box requires non-empty word entries.";
          if (!firstError) {
            firstError = `Question ${qNum} (Word Box) has blank or missing words in the Word Box.`;
            firstElementId = `card-${q.id}`;
          }
        } else if (!Array.isArray(sentences) || sentences.length === 0 || sentences.some((s: any) => !(typeof s === "string" ? s : s?.text)?.trim())) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Matching sentences cannot be blank.";
          if (!firstError) {
            firstError = `Question ${qNum} (Word Box) has blank matching sentences.`;
            firstElementId = `card-${q.id}`;
          }
        }
      } else if (q.type === "MATCHING") {
        const leftItems = Array.isArray(q.config?.leftItems) ? q.config.leftItems : [];
        const rightItems = Array.isArray(q.config?.rightItems) ? q.config.rightItems : [];
        const pairs = Array.isArray(q.config?.pairs) ? q.config.pairs : [];

        if (pairs.length > 0) {
          if (pairs.length < 2 || pairs.some((p: any) => !p?.left?.trim() || !p?.right?.trim())) {
            errors[qKey] = true;
            errors[`${qKey}_msg`] = "Matching requires at least 2 complete term & definition pairs.";
            if (!firstError) {
              firstError = `Question ${qNum} (Matching) has incomplete matching pairs.`;
              firstElementId = `card-${q.id}`;
            }
          }
        } else {
          if (leftItems.length < 2 || rightItems.length < 2 || leftItems.some((l: string) => !l?.trim()) || rightItems.some((r: any) => !(typeof r === "string" ? r : r?.value)?.trim())) {
            errors[qKey] = true;
            errors[`${qKey}_msg`] = "Matching requires at least 2 non-empty terms and definitions.";
            if (!firstError) {
              firstError = `Question ${qNum} (Matching) has blank terms or definitions.`;
              firstElementId = `card-${q.id}`;
            }
          }
        }
      } else if (q.type === "ORDERING") {
        const items = q.config?.items;
        if (!Array.isArray(items) || items.length < 2 || items.some((it: any) => !(typeof it === "string" ? it : it?.text)?.trim())) {
          errors[qKey] = true;
          errors[`${qKey}_msg`] = "Ordering requires at least 2 non-empty sequence items.";
          if (!firstError) {
            firstError = `Question ${qNum} (Ordering) has blank items or fewer than 2 steps.`;
            firstElementId = `card-${q.id}`;
          }
        }
      }
    }

    if (firstError) {
      return { firstError, errorMap: errors, firstElementId };
    }

    return null;
  };

  const handleSave = async (status: "PUBLISHED" | "DRAFT", shouldRedirect = true) => {
    const validation = validateActivity();
    if (validation) {
      setInvalidFieldKeys(validation.errorMap);
      toast.error(validation.firstError, { duration: 5000 });
      if (validation.firstElementId) {
        const el = document.getElementById(validation.firstElementId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.focus();
          }
        }
      }
      return null;
    }

    setInvalidFieldKeys({});
    setIsSaving(status);

    try {
      let response: any;
      const parsedPassMark = passingScore === "" ? 0 : (parseInt(passingScore) || 0);
      const computedPassLogic = mustPassAllSkills 
        ? (parsedPassMark === 0 ? "CRITERIA_ONLY" : "CRITERIA_AND_SCORE") 
        : "SCORE_ONLY";

      const serializedContent = JSON.stringify({
        version: 2,
        sections: taskSections
      });

      if (taskId) {
        const deleteQuestionIds = initialQuestionIds.filter(id => !questions.some(q => q.id === id));
        const updateQuestions = questions.filter(q => initialQuestionIds.includes(q.id)).map((q, index) => ({
          id: q.id,
          type: q.type,
          order: index + 1,
          criterionId: q.criterionId || undefined,
          config: JSON.stringify({ 
            question: q.content, 
            explanation: q.explanation || "", 
            marks: q.marks ?? 1, 
            sectionId: q.sectionId || taskSections[0]?.id,
            ...q.config 
          })
        }));
        const newQuestions = questions.filter(q => !initialQuestionIds.includes(q.id)).map((q, index) => ({
          type: q.type,
          order: index + 1,
          criterionId: q.criterionId || undefined,
          config: JSON.stringify({ 
            question: q.content, 
            explanation: q.explanation || "", 
            marks: q.marks ?? 1, 
            sectionId: q.sectionId || taskSections[0]?.id,
            ...q.config 
          }),
          clientKey: q.id
        }));

        response = await updateTask(taskId, {
          title,
          type: taskType,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          folderId: folderId || undefined,
          content: serializedContent,
          awardingBody: awardingBody !== "CUSTOM" ? awardingBody : undefined,
          entryType: [entryLevel],
          passMark: parsedPassMark,
          passLogic: computedPassLogic,
          deleteQuestionIds,
          updateQuestions,
          newQuestions,
        } as any);
      } else {
        const formattedQuestions = questions.map((q, index) => ({
          type: q.type,
          order: index + 1,
          criterionId: q.criterionId || undefined,
          config: JSON.stringify({ 
            question: q.content, 
            explanation: q.explanation || "", 
            marks: q.marks ?? 1,
            sectionId: q.sectionId || taskSections[0]?.id,
            ...q.config 
          })
        }));

        response = await createTask({
          title,
          type: taskType,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          questions: formattedQuestions as any,
          folderId: selectedFolderId || folderId || undefined,
          content: serializedContent,
          awardingBody: awardingBody !== "CUSTOM" ? awardingBody : undefined,
          entryType: [entryLevel],
          passMark: parsedPassMark,
          passLogic: computedPassLogic,
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
        const destFolder = selectedFolderId || folderId;
        if (destFolder) {
          router.push(`/content-library?folderId=${destFolder}`);
        } else {
          router.push("/content-library");
        }
      } else {
        if (!taskId && response && response.id) {
          const destFolder = selectedFolderId || folderId;
          router.replace(`?taskId=${response.id}${destFolder ? `&folderId=${destFolder}` : ''}`);
        }
      }
      
      return currentTaskId;
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message;
      const formattedMsg = Array.isArray(serverMsg)
        ? serverMsg.join(", ")
        : typeof serverMsg === "string"
          ? serverMsg
          : "Failed to save activity to the server.";

      toast.error(formattedMsg, { duration: 6000 });
      console.error("Save activity error:", e);
      return null;
    } finally {
      setIsSaving(null);
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

  const processImageFile = (sectionId: string, file: File | Blob) => {
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        updateTaskSection(sectionId, { imageUrl: base64Url, stimulusType: "IMAGE" });
        toast.success("Image attached to task context!");
      }
    };
    reader.readAsDataURL(file);
  };

  const extractAndAttachImage = async (sectionId: string, clipboardData: DataTransfer) => {
    // 1. Direct files from clipboard
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith("image/")) {
          processImageFile(sectionId, file);
          return true;
        }
      }
    }

    // 2. Direct items (e.g. from screenshot tool, right click copy image)
    if (clipboardData.items && clipboardData.items.length > 0) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processImageFile(sectionId, file);
            return true;
          }
        }
      }
    }

    // 3. HTML content (e.g. copied from web page with <img> tag)
    const htmlText = clipboardData.getData("text/html");
    if (htmlText) {
      const match = htmlText.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match && match[1]) {
        updateTaskSection(sectionId, { imageUrl: match[1], stimulusType: "IMAGE" });
        toast.success("Image attached to task context!");
        return true;
      }
    }

    // 4. Plain text URL or Data URI
    const plainText = clipboardData.getData("text/plain")?.trim();
    if (plainText) {
      if (
        plainText.startsWith("data:image/") || 
        plainText.startsWith("http://") || 
        plainText.startsWith("https://")
      ) {
        updateTaskSection(sectionId, { imageUrl: plainText, stimulusType: "IMAGE" });
        toast.success("Image attached to task context!");
        return true;
      }
    }

    return false;
  };

  const handleFileUpload = (sectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      processImageFile(sectionId, file);
    }
  };

  const handlePasteImage = async (sectionId: string, e: React.ClipboardEvent) => {
    if (e.clipboardData) {
      const success = await extractAndAttachImage(sectionId, e.clipboardData);
      if (success) {
        e.preventDefault();
      } else {
        toast.error("No image found in clipboard. Please copy an image first.");
      }
    }
  };

  const handleDropImage = async (sectionId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      const success = await extractAndAttachImage(sectionId, e.dataTransfer);
      if (!success) {
        toast.error("Please drop a valid image file.");
      }
    }
  };

  // Global window paste listener for instant paste when viewing/focused
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        (activeEl as HTMLElement).isContentEditable
      );

      const hasDirectImage = Array.from(e.clipboardData.items || []).some(i => i.type.startsWith("image/")) ||
                             (e.clipboardData.files && e.clipboardData.files.length > 0 && Array.from(e.clipboardData.files).some(f => f.type.startsWith("image/")));

      // If user is typing in a regular text field and didn't copy an image, don't interfere
      if (isTyping && !hasDirectImage) {
        return;
      }

      const targetId = activeSectionId || taskSections[0]?.id;
      if (targetId) {
        const success = await extractAndAttachImage(targetId, e.clipboardData);
        if (success) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [activeSectionId, taskSections]);

  if (taskId ? (!isLoaded || isLoadingTask) : !isLoaded) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50/50 gap-3">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p className="text-xs text-slate-500 font-medium animate-pulse">Loading assessment...</p>
      </div>
    );
  }

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks ?? 1), 0);

  const backUrl = (selectedFolderId || folderId) 
    ? `/content-library?folderId=${selectedFolderId || folderId}` 
    : `/content-library`;

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-8 flex flex-col gap-6 bg-slate-50/50 min-h-screen">
      {/* Breadcrumbs & Back Navigation */}
      <div className="flex items-center gap-3 text-sm text-slate-500 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(backUrl)}
          className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-white hover:text-slate-800 transition-colors shadow-2xs flex items-center gap-1.5 font-medium text-xs text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-500 font-medium py-1">
          <Link href="/content-library" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-400" />
            <span>Content Library</span>
          </Link>

          {currentFolder?.ancestors?.map((anc) => (
            <div key={anc.id} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href={`/content-library?folderId=${anc.id}`} className="hover:text-slate-900 transition-colors">
                {anc.name}
              </Link>
            </div>
          ))}

          {currentFolder && (
            <div key={currentFolder.id} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link href={`/content-library?folderId=${currentFolder.id}`} className="hover:text-slate-900 transition-colors">
                {currentFolder.name}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[240px]">{taskId ? (title || "Edit Assessment") : "New Assessment"}</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {taskId ? "Edit ESOL Assessment" : "ESOL Activity Builder"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.rtf,.txt" 
              onChange={handleImportPdf} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={isImporting || !!pdfFileForSnipping}
            />
            <Button 
              variant="outline" 
              disabled={isImporting || !!pdfFileForSnipping}
              className={`border-indigo-200 text-indigo-700 min-w-[140px] transition-all duration-300 ${
                isImporting 
                  ? "bg-indigo-50 animate-pulse border-indigo-300 shadow-inner cursor-not-allowed opacity-90" 
                  : !!pdfFileForSnipping 
                    ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-500" 
                    : "hover:bg-indigo-50 hover:shadow-sm cursor-pointer"
              }`}
            >
              {isImporting ? (
                <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-300">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm font-medium">{importProgressText}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
                  Import Document
                </>
              )}
            </Button>
          </div>

<Button 
            variant="outline" 
            className="border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={Boolean(isSaving)}
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2 text-blue-600" />
            Preview Assessment
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="font-medium border-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={Boolean(isSaving)}
            onClick={() => handleSave("DRAFT", false)}
          >
            {isSaving === "DRAFT" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-500" />
            ) : (
              <Save className="w-4 h-4 mr-2 text-slate-500" />
            )}
            {isSaving === "DRAFT" ? "Saving Draft..." : "Save Draft"}
          </Button>
          <Button 
            type="button" 
            className="font-medium bg-blue-500 hover:bg-blue-600 text-white shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" 
            disabled={Boolean(isSaving)}
            onClick={() => handleSave("PUBLISHED")}
          >
            {isSaving === "PUBLISHED" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSaving === "PUBLISHED" ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Canvas Area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
          {/* Activity Settings Card */}
          <Card className="border-slate-200 overflow-hidden shadow-none rounded-xl bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-800">
                  UK Qualification & Assessment Settings
                </CardTitle>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Total Marks: <span className="text-blue-600 font-bold">{totalCalculatedMarks}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-6">
              {/* Row 1: Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700">
                    Assessment / Activity Title <span className="text-red-500">*</span>
                  </Label>
                  {invalidFieldKeys.title && (
                    <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Title is required
                    </span>
                  )}
                </div>
                <Textarea 
                  id="field-title"
                  className={cn(
                    "min-h-9 resize-none focus-visible:ring-blue-500 shadow-none py-1.5 transition-all",
                    invalidFieldKeys.title ? "border-red-400 ring-2 ring-red-400/20 bg-red-50/20" : "border-slate-200"
                  )}
                  placeholder="e.g. Ascentis Entry 1 Reading Practice Paper A" 
                  value={title} 
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (invalidFieldKeys.title) {
                      setInvalidFieldKeys(prev => ({ ...prev, title: false }));
                    }
                  }} 
                  rows={1}
                />
              </div>

              {/* Row 2: Skill Selection & Parameters */}
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                {/* 1. Skill Mode Selector */}
                <div className="flex flex-col gap-1.5 w-full sm:w-[200px] shrink-0">
                  <span className="text-xs font-semibold text-slate-700 h-4 leading-4">
                    Primary Skill Area <span className="text-red-500">*</span>
                  </span>
                  <Select 
                    value={taskType} 
                    onValueChange={(val) => { 
                      if (val) setTaskType(val as TaskType); 
                      if (invalidFieldKeys.taskType) {
                        setInvalidFieldKeys(prev => ({ ...prev, taskType: false }));
                      }
                    }}
                  >
                    <SelectTrigger 
                      id="field-taskType"
                      className={cn(
                        "w-full text-xs shadow-sm transition-all",
                        invalidFieldKeys.taskType ? "border-red-400 ring-2 ring-red-400/20" : "border-slate-200"
                      )} 
                      style={{ height: '40px' }}
                    >
                      <SelectValue placeholder="Select skill">
                        {taskType === "READING" ? "📖 Reading" :
                         taskType === "WRITING" ? "✍️ Writing" :
                         taskType === "SPEAKING" ? "🗣️ Speaking" :
                         taskType === "LISTENING" ? "🎧 Listening" :
                         taskType === "GRAMMAR" ? "⚙️ Custom / Non-Preset" : "Select skill"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="min-w-[200px]">
                      <SelectItem value="READING" className="text-xs">📖 Reading</SelectItem>
                      <SelectItem value="WRITING" className="text-xs">✍️ Writing</SelectItem>
                      <SelectItem value="SPEAKING" className="text-xs">🗣️ Speaking</SelectItem>
                      <SelectItem value="LISTENING" className="text-xs">🎧 Listening</SelectItem>
                      <SelectItem value="GRAMMAR" className="text-xs">⚙️ Custom / Non-Preset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Passing Score Threshold */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between h-4">
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap leading-4">Passing Score Threshold (%)</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2 leading-4">0 or empty for no pass mark</span>
                  </div>
                  <Input 
                    type="number" 
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                    className="text-xs border-slate-200 shadow-sm focus-visible:ring-blue-500"
                    style={{ height: '40px' }}
                    placeholder="e.g. 75 (Leave empty for no pass mark)"
                    min="0"
                    max="100"
                  />
                </div>

                {/* 3. Must Pass All Skills Toggle */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="h-4 block" aria-hidden="true" />
                  <div className="flex items-center gap-2 bg-slate-50 px-3 rounded-lg border border-slate-100 shadow-sm" style={{ height: '40px' }}>
                    <Checkbox 
                      id="mustPassAllSkills" 
                      checked={mustPassAllSkills}
                      onCheckedChange={(checked) => setMustPassAllSkills(checked === true)}
                    />
                    <Label htmlFor="mustPassAllSkills" className="text-xs font-medium text-slate-700 cursor-pointer whitespace-nowrap">
                      Must pass all skills (Checklist)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Custom Skill Input (when Custom / Non-Preset is selected) */}
              {taskType === "GRAMMAR" && (
                <div className="space-y-2 pt-2 pb-2 p-4 mt-2 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Custom Skill Area Name
                    </Label>
                  </div>
                  <Input 
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    placeholder="e.g. Pronunciation & Phonics, Spelling & Punctuation..."
                    className="h-10 text-xs border-slate-200 bg-white shadow-2xs focus-visible:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 font-medium pt-1">
                    Define a custom skill area outside the standard four UK ESOL skill presets.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          
        {/* ========================================================================= */}
        {/* PDF SNIPPING TOOL INTEGRATION                                             */}
        {/* ========================================================================= */}
        {pdfFileForSnipping && (
          <div className="mb-6 w-full mx-auto flex items-center justify-between bg-indigo-50 border border-indigo-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-900">Original PDF Available</h4>
                <p className="text-xs text-indigo-700">Open the snipping tool to capture images from the PDF for task contexts.</p>
              </div>
            </div>
            <Button onClick={() => setShowSnippingOverlay(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
              <Scissors className="w-4 h-4 mr-2" /> Open Snipping Tool
            </Button>
          </div>
        )}

        {showSnippingOverlay && pdfFileForSnipping && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Scissors className="w-5 h-5 text-indigo-400" />
                PDF Snipping Tool
              </h3>
              <Button variant="ghost" onClick={() => setShowSnippingOverlay(false)} className="text-slate-300 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5 mr-2" /> Close
              </Button>
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
              <PdfSnippingTool 
                file={pdfFileForSnipping} 
                onSnip={(base64) => {
                  setSnippedImages(prev => [...prev, base64]);
                  toast.success("Image copied! Check the context gallery inside your tasks.");
                }} 
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MASTER ACTIVITY TASKS CONTAINER CARD (Single box containing all tasks)    */}
        {/* ========================================================================= */}
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-slate-50/50 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <DragDropContext onDragEnd={onDragEnd}>
          {taskSections.map((section, secIdx) => {
            const sectionQuestions = questions.filter(q => (q.sectionId || taskSections[0]?.id) === section.id);
            const sectionMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks ?? 1), 0);

            return (
              <div key={section.id} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-none">
                
                {/* Section Header (Grey Background) */}
                <div className="bg-slate-50/80 border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 max-w-xl">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Task {secIdx + 1}</span>
                    </div>
                    <Input
                              value={section.title}
                              onChange={(e) => updateTaskSection(section.id, { title: e.target.value })}
                              placeholder={`Task ${secIdx + 1} Title`}
                              className="bg-white border-slate-200 text-slate-800 font-semibold text-xs h-8 focus-visible:ring-blue-400 placeholder:text-slate-400"
                            />
                  </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-auto">
                          <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                            {sectionQuestions.length} {sectionQuestions.length === 1 ? 'Question' : 'Questions'} ({sectionMarks} {sectionMarks === 1 ? 'Mark' : 'Marks'})
                          </span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2.5 text-xs font-medium"
                            onClick={() => removeTaskSection(section.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Task
                          </Button>
                        </div>
                      </div>

                      <div className="p-5 space-y-5">
                        {/* Section Instruction Field */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700">
                            Task Instruction
                          </Label>
                          <Input 
                            value={section.instruction}
                            onChange={(e) => updateTaskSection(section.id, { instruction: e.target.value })}
                            placeholder="e.g. Read the text and answer questions."
                            className="text-xs border-slate-200 h-9 bg-slate-50/50 font-medium text-slate-800 focus-visible:ring-blue-400"
                          />
                        </div>

                        {/* Reading Context Area */}
                        {taskType === "READING" && (
                          <div className="p-4 bg-slate-50/60 border border-slate-200/80 rounded-xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-semibold text-slate-800">
                                  Context for {section.title}
                                </span>
                              </div>
                              
                              {/* Dual Mode Switcher */}
                              <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => updateTaskSection(section.id, { stimulusType: "IMAGE" })}
                                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                                    section.stimulusType === "IMAGE" 
                                      ? "bg-blue-500 text-white shadow-2xs" 
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  🖼️ Image / Poster Scan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateTaskSection(section.id, { stimulusType: "RICH_TEXT" })}
                                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                                    section.stimulusType === "RICH_TEXT" 
                                      ? "bg-blue-500 text-white shadow-2xs" 
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  📝 Formatted Text & Tables
                                </button>
                              </div>
                            </div>

                            {/* Image Mode */}
                            {section.stimulusType === "IMAGE" ? (
                              <div className="space-y-3">
                                {/* Inline Snipped Images Gallery */}
                                {snippedImages.length > 0 && !section.imageUrl && (
                                  <div className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-indigo-700 mb-2 flex items-center">
                                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                                      Select from Snipped Images
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                      {snippedImages.map((img, idx) => (
                                        <div 
                                          key={idx} 
                                          onClick={() => updateTaskSection(section.id, { imageUrl: img })}
                                          className="flex-shrink-0 w-24 h-24 border-2 border-transparent hover:border-indigo-400 rounded-lg overflow-hidden cursor-pointer shadow-sm bg-white transition-all hover:scale-105"
                                        >
                                          <img src={img} className="w-full h-full object-contain p-1" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {section.imageUrl ? (
                                  <div className="relative rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center gap-3">
                                    <img 
                                      src={section.imageUrl} 
                                      alt="Stimulus Graphic Preview" 
                                      className="max-h-72 object-contain rounded-lg border border-slate-100 shadow-2xs"
                                    />
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-7"
                                        onClick={() => {
                                          const img = section.imageUrl;
                                          if (typeof img === "string" && img.length > 0) {
                                            setSnippedImages(prev => Array.from(new Set([...prev, img])));
                                          }
                                          updateTaskSection(section.id, { imageUrl: "" });
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" /> Remove Image
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    tabIndex={0}
                                    onFocus={() => setActiveSectionId(section.id)}
                                    onClick={() => setActiveSectionId(section.id)}
                                    onPaste={(e) => {
                                      setActiveSectionId(section.id);
                                      handlePasteImage(section.id, e);
                                    }}
                                    onDrop={(e) => {
                                      setActiveSectionId(section.id);
                                      handleDropImage(section.id, e);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl p-6 bg-white flex flex-col items-center justify-center text-center gap-3 transition-all cursor-default group"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                                      🖼️
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-semibold text-slate-800">
                                        Attach authentic exam poster, notice scan, receipt, or tickets
                                      </p>
                                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                                        <span>Click box and paste directly with</span>
                                        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 border border-slate-300 rounded text-slate-700 shadow-2xs">
                                          Ctrl + V / ⌘ + V
                                        </kbd>
                                        <span>or drag & drop</span>
                                      </div>
                                    </div>

                                    <div className="pt-1">
                                      <label className="inline-flex items-center justify-center rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer h-8 px-4 transition-colors shadow-2xs">
                                        📁 Choose Image File
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          onChange={(e) => handleFileUpload(section.id, e)}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Rich Document Mode */
                              <div className="space-y-1.5">
                                <RichTextEditor 
                                  value={section.content || ""}
                                  onChange={(val) => updateTaskSection(section.id, { content: val })}
                                  placeholder="Create your formatted exam text, notice, letter, or table..."
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Questions belonging to this Task Section */}
                        <div className="space-y-4 pt-1">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                              Questions for {section.title} ({sectionQuestions.filter(q => q.type !== "INSTRUCTION").length})
                            </h4>
                            <span className="text-[11px] text-slate-400">Drag to reorder within this task</span>
                          </div>

                          {sectionQuestions.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                              <p className="text-xs font-medium text-slate-600 mb-1">
                                No questions or instructions added to {section.title} yet.
                              </p>
                              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-3">
                                Use the buttons below to add questions or section instructions to this task.
                              </p>
                            </div>
                          ) : (
                            <Droppable droppableId={`droppable-${section.id}`}>
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                  {(() => {
                                    let qNum = 0;
                                    return questions.map((q, index) => {
                                      if ((q.sectionId || taskSections[0]?.id) !== section.id) return null;
                                      const currentQNum = q.type === "INSTRUCTION" ? null : ++qNum;
                                      return (
                                        <Draggable key={q.id} draggableId={q.id} index={index}>
                                          {(dragProvided) => (
                                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                                              <QuestionCard 
                                                q={q} 
                                                index={index} 
                                                questionNumber={currentQNum}
                                                dragHandleProps={dragProvided.dragHandleProps} 
                                                updateQuestion={updateQuestion} 
                                                removeQuestion={removeQuestion}
                                                criteriaList={criteriaList}
                                                isInvalid={Boolean(invalidFieldKeys[`q_${q.id}`])}
                                                errorMsg={invalidFieldKeys[`q_${q.id}_msg`]}
                                              />
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    });
                                  })()}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}

                          {/* Quick Add Question Bar for this specific Task Section */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                              <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                              Add to {section.title}:
                            </span>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50/40 text-blue-700 font-semibold" onClick={() => addQuestion("INSTRUCTION", section.id)}>
                                + Instruction Line
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("MCQ", section.id)}>
                                + Multiple Choice
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("TRUE_FALSE", section.id)}>
                                + True / False
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("GAP_FILL", section.id)}>
                                + Fill Blanks
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("WORD_BOX_MATCH", section.id)}>
                                + Word Box
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("MATCHING", section.id)}>
                                + Matching
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("QUESTION_ANSWER", section.id)}>
                                + Short Fact
                              </Button>
                              <Button type="button" variant="outline" size="sm" className="h-7 text-xs bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-slate-700" onClick={() => addQuestion("ORDERING", section.id)}>
                                + Ordering
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </DragDropContext>

              {taskSections.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base">
                    📋
                  </div>
                  <h4 className="text-slate-800 font-semibold text-sm">No Task Sections Created</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Click below to create a task section and attach reading stimulus materials and questions.
                  </p>
                  <Button type="button" onClick={addTaskSection} className="bg-blue-500 hover:bg-blue-600 text-white text-xs mt-1">
                    <PlusCircle className="w-4 h-4 mr-1.5" /> Add Task 1 Section
                  </Button>
                </div>
              )}

              {taskSections.length > 0 && (
                <button
                  type="button"
                  onClick={addTaskSection}
                  className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl bg-slate-50 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 text-slate-700 hover:text-blue-600 font-semibold text-xs group cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                  Add Another Task Section (Task {taskSections.length + 1})
                </button>
              )}
            </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sticky Sidebar: Overview & Global Question Palette */}
        <div className="col-span-12 lg:col-span-3 sticky top-6 flex flex-col gap-5">
          {/* 1. Quick Overview Summary Card (FIRST) */}
          <Card className="border-slate-200 shadow-none rounded-xl bg-white overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="text-xs font-bold text-slate-800 uppercase flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                <span className="flex items-center gap-1.5 leading-snug">
                  <Award className="w-4 h-4 text-blue-600 shrink-0" />
                  Assessment Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold shrink-0">
                  {questions.length} Items
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Awarding Board:</span>
                  <span className="font-semibold text-slate-900">{awardingBody}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Regulated Level:</span>
                  <span className="font-semibold text-slate-900">{entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Task Sections:</span>
                  <span className="font-semibold text-slate-900">{taskSections.length} {taskSections.length === 1 ? 'Task' : 'Tasks'}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Skill Focus:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px] text-right" title={taskType === "GRAMMAR" && customSkillName.trim() ? customSkillName : taskType === "GRAMMAR" ? "Custom Practice" : taskType}>
                    {taskType === "GRAMMAR" && customSkillName.trim()
                      ? customSkillName
                      : taskType === "GRAMMAR"
                      ? "Custom Practice"
                      : taskType}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Pass Threshold:</span>
                  <span className="font-semibold text-blue-700">
                    {passingScore === "" || passingScore === "0" ? 'N/A (No pass mark)' : `${passingScore}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-blue-500 p-2.5 rounded-lg text-white mt-1">
                  <span className="font-semibold text-blue-100">Total Marks:</span>
                  <span className="font-bold text-lg leading-none">{totalCalculatedMarks}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Global Question Palette */}
          <Card className="border-slate-200 shadow-none rounded-xl bg-white overflow-hidden">
            <CardHeader className="py-3 px-4 bg-slate-50/70 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick Question Palette
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => addQuestion("INSTRUCTION")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-blue-50/20 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    📄
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-900">Instruction Line</div>
                    <div className="text-[10px] text-slate-500">e.g. Questions 1–8</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("MCQ")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Multiple Choice</div>
                    <div className="text-[10px] text-slate-400">Single or multi-select</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("TRUE_FALSE")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    TF
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">True / False</div>
                    <div className="text-[10px] text-slate-400">Statement verification</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("GAP_FILL")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Fill in the Blanks</div>
                    <div className="text-[10px] text-slate-400">Grammar & verb drills</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("WORD_BOX_MATCH")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    W
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Word Box Match</div>
                    <div className="text-[10px] text-slate-400">Word bank selection</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("MATCHING")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Pair Matching</div>
                    <div className="text-[10px] text-slate-400">Headings & text types</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("QUESTION_ANSWER")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    Q
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Short Fact Answer</div>
                    <div className="text-[10px] text-slate-400">Dates, prices, postcodes</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("ORDERING")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    O
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Step Ordering</div>
                    <div className="text-[10px] text-slate-400">Chronological sequencing</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fullscreen Assessment Live Preview Mode */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto animate-in fade-in duration-200">
          {/* Top Sticky Bar with Title and Exit Preview Button */}
          <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Eye className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">Student Examination Preview</h2>
                <p className="text-[11px] text-slate-500">Live interactive split-screen simulation</p>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsPreviewOpen(false)} 
              className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold text-xs px-3.5 h-8.5 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-500" />
              Exit Preview
            </Button>
          </div>

          {/* Full Screen Content Body */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
            <LocalTaskPreview 
              title={title} 
              taskType={taskType} 
              questions={questions}
              taskSections={taskSections}
              awardingBody={awardingBody}
              entryLevel={entryLevel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
