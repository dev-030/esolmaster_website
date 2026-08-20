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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Send, Trash2, GripVertical, Save, Eye, Award, CheckCircle2, AlertCircle, Sparkles, Folder, BookOpen } from "lucide-react";
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

type QuestionType = "MCQ" | "GAP_FILL" | "WORD_BOX_MATCH" | "MATCHING" | "QUESTION_ANSWER" | "ORDERING" | "TRUE_FALSE";
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

interface QuestionConfig {
  id: string;
  type: QuestionType;
  content: string;
  explanation?: string;
  criterionId?: string;
  config: any;
  marks?: number;
  isExpanded?: boolean;
}

const LOCAL_STORAGE_KEY = "esolmaster_activity_builder_draft";

const QuestionCard = React.memo(({ q, index, dragHandleProps, updateQuestion, removeQuestion, criteriaList }: any) => {
  const isExpanded = q.isExpanded !== false;
  const currentCriterion = criteriaList?.find((c: any) => c.id === q.criterionId);

  return (
    <Card className="border-slate-100 shadow-none relative group bg-white overflow-hidden transition-all rounded-xl">
      <div 
        className="absolute left-2 top-3.5 cursor-grab text-slate-300 hover:text-slate-500 transition-colors z-10 opacity-0 group-hover:opacity-100"
        {...dragHandleProps}
      >
        <GripVertical size={18} />
      </div>
      <div className="pl-7">
        <CardHeader className="py-3 px-5 bg-slate-50/30 border-b border-slate-100 flex flex-row items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <CardTitle className="text-[13px] font-semibold text-slate-700 tracking-wide">
              {index + 1}. {q.type.replace(/_/g, " ")}
            </CardTitle>
            {currentCriterion && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Criteria {currentCriterion.code}
              </span>
            )}
          </div>
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
            {/* Assessment Criteria Selector */}
            <div className="p-3.5 bg-indigo-50/40 border border-indigo-100/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  UK ESOL Assessment Criterion
                </Label>
                <p className="text-[11px] text-slate-500">
                  Tag this question to a national syllabus skill (e.g. 1.1 Narrative, 3.2 Signs, 3.3 Postcodes).
                </p>
              </div>
              <Select 
                value={q.criterionId || "none"} 
                onValueChange={(val) => updateQuestion(q.id, { criterionId: val === "none" ? undefined : val })}
              >
                <SelectTrigger className="w-full sm:w-[280px] h-8 text-xs bg-white border-indigo-200">
                  <SelectValue placeholder="Select skill criterion..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none" className="text-xs text-slate-500 italic">None / General</SelectItem>
                  {criteriaList?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      <span className="font-semibold text-indigo-700 mr-1.5">[{c.code}]</span> {c.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
        )}
      </div>
    </Card>
  );
});

const LocalTaskPreview = ({ title, taskType, questions, readingPassage, awardingBody, entryLevel }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  
  const skillMeta: Record<string, { label: string; emoji: string }> = {
    READING: { label: "Reading", emoji: "📖" },
    WRITING: { label: "Writing", emoji: "✍️" },
    LISTENING: { label: "Listening", emoji: "🎧" },
    SPEAKING: { label: "Speaking", emoji: "🗣️" },
    GRAMMAR: { label: "Grammar", emoji: "📝" },
    VOCABULARY: { label: "Vocabulary", emoji: "💬" },
  };

  const currentSkill = skillMeta[taskType] || { label: taskType, emoji: "📄" };

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-slate-500">No questions added yet to preview.</div>;
  }

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title || "Untitled Activity"}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 shadow-sm">
            <span>{currentSkill.emoji}</span> {currentSkill.label}
          </span>
          {awardingBody && awardingBody !== "CUSTOM" && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
              {awardingBody}
            </span>
          )}
          {entryLevel && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}
            </span>
          )}
        </div>
      </div>
      
      {/* Reading Passage Stimulus if applicable */}
      {taskType === "READING" && readingPassage && (
        <div className="bg-amber-50/40 border border-amber-200/70 rounded-xl p-5 text-slate-800 space-y-2">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>📖</span> Stimulus / Reading Passage
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{readingPassage}</div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-slate-100/80 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500 ease-out" 
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
  const [readingPassage, setReadingPassage] = useState("");
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [initialQuestionIds, setInitialQuestionIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(!!taskId);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
      getTaskById(taskId).then(task => {
        setTitle(task.title || "");
        setTaskType((task.type as TaskType) || "READING");
        setPassingScore(task.passMark !== null && task.passMark !== undefined ? task.passMark.toString() : "75");
        if (task.readingContent?.passLogic) {
          setMustPassAllSkills(task.readingContent.passLogic === "CRITERIA_ONLY" || task.readingContent.passLogic === "CRITERIA_AND_SCORE");
        }
        setReadingPassage(task.content || "");
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
            let configObj = { question: "", prompt: "", explanation: "", marks: 1, data: undefined } as any;
            try { configObj = JSON.parse(q.config); } catch(e) {}
            
            const { question, prompt, explanation, marks, data, ...restConfig } = configObj;
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
      const parsedPassMark = passingScore === "" ? 0 : (parseInt(passingScore) || 0);
      const computedPassLogic = mustPassAllSkills 
        ? (parsedPassMark === 0 ? "CRITERIA_ONLY" : "CRITERIA_AND_SCORE") 
        : "SCORE_ONLY";

      if (taskId) {
        const deleteQuestionIds = initialQuestionIds.filter(id => !questions.some(q => q.id === id));
        const updateQuestions = questions.filter(q => initialQuestionIds.includes(q.id)).map((q, index) => ({
          id: q.id,
          type: q.type,
          order: index + 1,
          criterionId: q.criterionId || undefined,
          config: JSON.stringify({ question: q.content, explanation: q.explanation || "", marks: q.marks ?? 1, ...q.config })
        }));
        const newQuestions = questions.filter(q => !initialQuestionIds.includes(q.id)).map((q, index) => ({
          type: q.type,
          order: index + 1,
          criterionId: q.criterionId || undefined,
          config: JSON.stringify({ question: q.content, explanation: q.explanation || "", marks: q.marks ?? 1, ...q.config }),
          clientKey: q.id
        }));

        response = await updateTask(taskId, {
          title,
          type: taskType,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          folderId: folderId || undefined,
          content: readingPassage,
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
            ...q.config 
          })
        }));

        response = await createTask({
          title,
          type: taskType,
          status: status === "PUBLISHED" ? "PENDING_APPROVAL" : "DRAFT",
          questions: formattedQuestions as any,
          folderId: selectedFolderId || folderId || undefined,
          content: readingPassage,
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
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (q.marks ?? 1), 0);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-8 flex flex-col gap-8 bg-slate-50/50 min-h-screen">
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
          <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview Assessment
          </Button>
          <Button type="button" variant="outline" className="font-medium border-slate-200 hover:bg-slate-50" onClick={() => handleSave("DRAFT", false)}>
            <Save className="w-4 h-4 mr-2 text-slate-500" />
            Save Draft
          </Button>
          <Button type="button" className="font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={() => handleSave("PUBLISHED")}>
            <Send className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Canvas Area */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">
          {/* Activity Settings Card */}
          <Card className="border-slate-100 overflow-hidden shadow-none rounded-xl bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 px-6 pt-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-slate-800">
                  UK Qualification & Assessment Settings
                </CardTitle>
              </div>
              <div className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Total Marks: <span className="text-indigo-600 font-bold">{totalCalculatedMarks}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-6">


              {/* Row 1: Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Assessment / Activity Title</Label>
                <Textarea 
                  className="min-h-9 resize-none focus-visible:ring-indigo-500 border-slate-200 shadow-none py-1.5"
                  placeholder="e.g. Ascentis Entry 1 Reading Practice Paper A" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  rows={1}
                />
              </div>

              {/* Row 2: Skill Selection & Parameters */}
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                {/* 1. Skill Mode Selector */}
                <div className="flex flex-col gap-1.5 w-full sm:w-[200px] shrink-0">
                  <span className="text-xs font-semibold text-slate-700 h-4 leading-4">Primary Skill Area</span>
                  <Select 
                    value={taskType} 
                    onValueChange={(val) => { if (val) setTaskType(val as TaskType); }}
                  >
                    <SelectTrigger className="w-full text-xs border-slate-200 shadow-sm" style={{ height: '40px' }}>
                      <SelectValue placeholder="Select skill">
                        {taskType === "READING" ? "📖 Reading" :
                         taskType === "WRITING" ? "✍️ Writing" :
                         taskType === "SPEAKING" ? "🗣️ Speaking" :
                         taskType === "LISTENING" ? "🎧 Listening" :
                         taskType === "GRAMMAR" ? "⚙️ Custom / Non-Preset" : "Select skill"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="min-w-[200px]">
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
                    className="text-xs border-slate-200 shadow-sm"
                    style={{ height: '40px' }}
                    placeholder="e.g. 75 (Leave empty for no pass mark)"
                    min="0"
                    max="100"
                  />
                </div>

                {/* 3. Must Pass All Skills Toggle */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {/* invisible spacer to match label height */}
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
                <div className="space-y-2 pt-2 pb-2 p-4 mt-2 bg-indigo-50/50 border border-indigo-100/80 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Custom Skill Area Name
                    </Label>
                  </div>
                  <Input 
                    value={customSkillName}
                    onChange={(e) => setCustomSkillName(e.target.value)}
                    placeholder="e.g. Pronunciation & Phonics, Spelling & Punctuation..."
                    className="h-10 text-xs border-indigo-200 bg-white shadow-sm focus-visible:ring-indigo-500"
                  />
                  <p className="text-[11px] text-indigo-600/70 font-medium pt-1">
                    Define a custom skill area outside the standard four UK ESOL skill presets.
                  </p>
                </div>
              )}





              {/* Reading Stimulus Passage Box */}
              {taskType === "READING" && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Reading Passage / Stimulus Material
                    </Label>
                    <span className="text-[11px] text-slate-400">Displayed to students alongside questions</span>
                  </div>
                  <Textarea
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                    placeholder="Enter the authentic UK reading text, notice, letter, or advert here (e.g. Fairvale Surgery rules, NHS appointments, Supermarket offers)..."
                    className="min-h-[140px] text-xs font-normal border-slate-200 leading-relaxed"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Questions Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Assessment Questions ({questions.length})
              </h3>
              {questions.length > 1 && (
                <span className="text-xs text-slate-400">
                  Drag handles to re-order questions
                </span>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white/60">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-100">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h4 className="text-slate-800 font-semibold text-sm mb-1">No questions in this assessment</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Click question types from the palette on the right to start building your UK ESOL paper.
                </p>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="questions-droppable">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {questions.map((q, index) => (
                        <Draggable key={q.id} draggableId={q.id} index={index}>
                          {(dragProvided) => (
                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                              <QuestionCard 
                                q={q} 
                                index={index} 
                                dragHandleProps={dragProvided.dragHandleProps} 
                                updateQuestion={updateQuestion} 
                                removeQuestion={removeQuestion}
                                criteriaList={criteriaList}
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

        {/* Right Sticky Sidebar: 1. Assessment Summary FIRST, 2. Question Palette SECOND */}
        <div className="col-span-12 lg:col-span-3 sticky top-6 flex flex-col gap-5">
          {/* 1. Quick Overview Summary Card (FIRST) */}
          <Card className="border-indigo-100/60 shadow-sm rounded-xl bg-gradient-to-b from-indigo-50/50 to-white overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="text-xs font-bold text-indigo-900 uppercase flex items-start justify-between border-b border-indigo-100/50 pb-3 gap-2">
                <span className="flex items-center gap-1.5 leading-snug">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  Assessment Summary
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-semibold shrink-0">
                  {questions.length} Items
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Awarding Board:</span>
                  <span className="font-semibold text-slate-900">{awardingBody}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Regulated Level:</span>
                  <span className="font-semibold text-slate-900">{entryLevel.replace("ENTRY", "Entry ").replace("LEVEL", "Level ")}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Skill Focus:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px] text-right" title={taskType === "GRAMMAR" && customSkillName.trim() ? customSkillName : taskType === "GRAMMAR" ? "Custom Practice" : taskType}>
                    {taskType === "GRAMMAR" && customSkillName.trim()
                      ? customSkillName
                      : taskType === "GRAMMAR"
                      ? "Custom Practice"
                      : taskType}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                  <span className="font-medium">Pass Threshold:</span>
                  <span className="font-semibold text-emerald-600">
                    {passingScore === "" || passingScore === "0" ? 'N/A (No pass mark)' : `${passingScore}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-indigo-600 p-2.5 rounded-lg text-white mt-1">
                  <span className="font-semibold text-indigo-100">Total Marks:</span>
                  <span className="font-bold text-lg leading-none">{totalCalculatedMarks}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Question Palette (SECOND) */}
          <Card className="border-slate-100 shadow-none rounded-xl bg-white overflow-hidden">
            <CardHeader className="py-3 px-4 bg-slate-50/70 border-b border-slate-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Question Palette
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => addQuestion("MCQ")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Multiple Choice</div>
                    <div className="text-[10px] text-slate-400">Single or multi-select</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("TRUE_FALSE")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xs group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    TF
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">True / False</div>
                    <div className="text-[10px] text-slate-400">Statement verification</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("GAP_FILL")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Fill in the Blanks</div>
                    <div className="text-[10px] text-slate-400">Grammar & verb drills</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("WORD_BOX_MATCH")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    W
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Word Box Match</div>
                    <div className="text-[10px] text-slate-400">Word bank selection</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("MATCHING")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    M
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Pair Matching</div>
                    <div className="text-[10px] text-slate-400">Headings & text types</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("QUESTION_ANSWER")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xs group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    Q
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Short Fact Answer</div>
                    <div className="text-[10px] text-slate-400">Dates, prices, postcodes</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>

              <button
                type="button"
                onClick={() => addQuestion("ORDERING")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    O
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Step Ordering</div>
                    <div className="text-[10px] text-slate-400">Chronological sequencing</div>
                  </div>
                </div>
                <PlusCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assessment Live Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 p-6 md:p-10">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" /> Student Examination Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Preview the interactive test experience as a student taking this assessment.
            </DialogDescription>
          </DialogHeader>

          <LocalTaskPreview 
            title={title} 
            taskType={taskType} 
            questions={questions}
            readingPassage={readingPassage}
            awardingBody={awardingBody}
            entryLevel={entryLevel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
