const fs = require('fs');
const file = 'src/webcomponents/teacher/assign-task/ActivityBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add LocalPreview component
const localPreviewCode = `
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
      config: JSON.stringify({ question: q.content, explanation: q.explanation || "", marks: q.marks || 1, ...baseConfig })
    };
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(c => c + 1);
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">{title || "Untitled Activity"}</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {meta.emoji} {meta.label}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: \`\${((currentIndex + 1) / totalQuestions) * 100}%\` }}
          />
        </div>
        <span className="text-sm font-medium text-slate-500 w-12 text-right">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-1">
        <QuestionRenderer 
          question={formatQuestion(currentQuestion) as any} 
          userAnswer={answers[currentQuestion.id]}
          setAnswer={(ans) => setAnswers(prev => ({...prev, [currentQuestion.id]: ans}))}
          submitted={submitted}
        />
      </div>

      <div className="flex items-center justify-between pt-4">
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
`;

// Insert LocalTaskPreview before export default function
const insertMarker = "export default function ActivityBuilder() {";
content = content.replace(insertMarker, localPreviewCode + "\n\n" + insertMarker);

// Fix QuestionRenderer import
const importMarker = "import { TaskRunner } from \"@/webcomponents/sameroute/class/tasks/TaskRunner\";";
const newImport = "import { QuestionRenderer } from \"@/webcomponents/sameroute/class/tasks/QuestinRenderer\";";
content = content.replace(importMarker, newImport);

// Replace TaskRunner in JSX and fix Dialog styling
const oldJsx = \`      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] overflow-y-auto p-0 border-0 flex flex-col bg-slate-50">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
            <DialogTitle className="text-xl font-bold text-slate-800">Preview Mode</DialogTitle>
            <p className="text-sm text-slate-500">You are viewing this task exactly as a student would.</p>
          </DialogHeader>
          <div className="flex-1 p-6 relative">
            {previewTaskId && <TaskRunner taskIdProp={previewTaskId} />}
          </div>
        </DialogContent>
      </Dialog>\`;
      
const newJsx = \`      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl w-[90vw] h-[85vh] overflow-y-auto p-0 border-0 flex flex-col bg-slate-50/80 backdrop-blur-md rounded-2xl shadow-2xl">
          <DialogHeader className="px-8 py-5 border-b border-slate-200/60 bg-white/90 sticky top-0 z-50 backdrop-blur-xl">
            <DialogTitle className="text-xl font-bold text-slate-800">Student Preview</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Experience this activity exactly as your students will see it.</p>
          </DialogHeader>
          <div className="flex-1 p-8 relative">
            <LocalTaskPreview title={title} taskType={taskType} questions={questions} />
          </div>
        </DialogContent>
      </Dialog>\`;
content = content.replace(oldJsx, newJsx);

// Update handlePreview to skip save
const oldPreviewHandler = \`  const handlePreview = async () => {
    if (!title) {
      toast.error("Please enter a title for the activity before previewing.");
      return;
    }
    const currentTaskId = await handleSave("DRAFT", false);
    if (currentTaskId) {
      setPreviewTaskId(currentTaskId);
      setIsPreviewOpen(true);
    }
  };\`;
const newPreviewHandler = \`  const handlePreview = () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question to preview.");
      return;
    }
    setIsPreviewOpen(true);
  };\`;
content = content.replace(oldPreviewHandler, newPreviewHandler);

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully added LocalTaskPreview!");
