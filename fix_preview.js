const fs = require('fs');
const file = 'src/webcomponents/teacher/assign-task/ActivityBuilder.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports
const importMarker = "import { Button } from \"@/components/ui/button\";";
const importInsert = `import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskRunner } from "@/webcomponents/sameroute/class/tasks/TaskRunner";
`;
content = content.replace(importMarker, importInsert + importMarker);

// 2. Add previewTaskId state
const stateMarker = "const [isPreviewOpen, setIsPreviewOpen] = useState(false);";
const stateInsert = "const [isPreviewOpen, setIsPreviewOpen] = useState(false);\n  const [previewTaskId, setPreviewTaskId] = useState<string | null>(null);";
content = content.replace(stateMarker, stateInsert);

// 3. Update handlePreview
const handlePreviewOld = `  const handlePreview = async () => {
    if (!title) {
      toast.error("Please enter a title for the activity before previewing.");
      return;
    }
    const currentTaskId = await handleSave("DRAFT", false);
    if (currentTaskId) {
      router.push(\`/assign-task/preview/\${currentTaskId}\`);
    }
  };`;
const handlePreviewNew = `  const handlePreview = async () => {
    if (!title) {
      toast.error("Please enter a title for the activity before previewing.");
      return;
    }
    const currentTaskId = await handleSave("DRAFT", false);
    if (currentTaskId) {
      setPreviewTaskId(currentTaskId);
      setIsPreviewOpen(true);
    }
  };`;
content = content.replace(handlePreviewOld, handlePreviewNew);

// 4. Add Dialog JSX
const jsxMarker = `      </div>
    </div>
  );
}`;
const jsxInsert = `      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[85vh] overflow-y-auto p-0 border-0 flex flex-col bg-slate-50">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-50">
            <DialogTitle className="text-xl font-bold text-slate-800">Preview Mode</DialogTitle>
            <p className="text-sm text-slate-500">You are viewing this task exactly as a student would.</p>
          </DialogHeader>
          <div className="flex-1 p-6 relative">
            {previewTaskId && <TaskRunner taskIdProp={previewTaskId} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}`;
content = content.replace(jsxMarker, jsxInsert);

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully updated preview to modal!");
