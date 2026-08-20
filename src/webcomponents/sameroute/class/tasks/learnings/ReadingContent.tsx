import Image from "next/image";

export interface ReadingContentType {
  id: string;
  taskId: string;
  content: string;
  imageUrl?: string;
  entryType: string[];
  awardingBody?: string | null;
  passLogic: string;
  passMark?: number | null;
}

export const ReadingContent = ({ data }: { data: ReadingContentType }) => {
  let sections: any[] = [];
  try {
    const parsed = JSON.parse(data.content);
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      sections = parsed.sections;
    }
  } catch (e) {
    sections = [{
      title: "Task 1",
      instruction: "Read the passage below.",
      stimulusType: data.imageUrl ? "IMAGE" : "RICH_TEXT",
      imageUrl: data.imageUrl,
      content: data.content
    }];
  }

  if (sections.length === 0) {
    sections = [{
      title: "Task 1",
      instruction: "Read the passage below.",
      stimulusType: data.imageUrl ? "IMAGE" : "RICH_TEXT",
      imageUrl: data.imageUrl,
      content: data.content
    }];
  }

  return (
    <div className="max-w-4xl mx-auto p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900">Reading Stimulus Material</h2>
        {data.entryType?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.entryType.map((entry) => (
              <span
                key={entry}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-0.5 rounded-full"
              >
                {entry}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-none">
            <div className="bg-slate-50 border-b border-slate-200 text-slate-800 px-4 py-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">{section.title || `Task ${idx + 1}`}</span>
              <span className="text-xs text-slate-500 font-medium">{section.instruction}</span>
            </div>
            
            <div className="p-5">
              {section.stimulusType === "IMAGE" && section.imageUrl ? (
                <div className="flex justify-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <img
                    src={section.imageUrl}
                    alt={section.title || "Reading illustration"}
                    className="max-h-96 object-contain rounded-md"
                  />
                </div>
              ) : section.content ? (
                <div
                  className="prose prose-slate max-w-none leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              ) : (
                <p className="text-slate-400 italic text-xs">No stimulus provided.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
