import { Task } from "@/types/task"
import { Check, X } from "lucide-react"

const typeBadgeVariant: Record<Task["type"], string> = {
  GRAMMAR: "bg-violet-50 text-violet-700 border-violet-200/60",
  READING: "bg-primary/10 text-primary border-primary/25",
  WRITING: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  LISTENING: "bg-sky-50 text-sky-700 border-sky-200/60",
  SPEAKING: "bg-amber-50 text-amber-700 border-amber-200/60",
  VOCABULARY: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
}

export const PendingTaskCard = ({
  task,
  onApprove,
  onReject,
}: {
  task: Task
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-3 sm:py-3.5">
      {/* Left content */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Row 1: title + badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-[13px] font-semibold text-slate-900 truncate">
            {task.title}
          </span>
          <span
            className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border font-medium ${typeBadgeVariant[task.type] || "bg-slate-100 text-slate-700 border-slate-200/60"}`}
          >
            {task.type}
          </span>
        </div>
        {/* Row 2: metadata */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
          <span className="font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">
            Pending
          </span>
          <span>·</span>
          <span>Submitted {new Date(task.createdAt).toLocaleDateString()}</span>
          <span>·</span>
          <span className="truncate">
            by {task.createdBy.firstName} {task.createdBy.lastName}
          </span>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
        <button
          onClick={() => onReject(task.id)}
          className="h-8 w-8 rounded-lg border border-slate-200/80 bg-white hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shadow-none"
          title="Reject Task"
        >
          <X size={15} />
        </button>
        <button
          onClick={() => onApprove(task.id)}
          className="h-8 w-8 rounded-lg border border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer shadow-none"
          title="Approve Task"
        >
          <Check size={15} />
        </button>
      </div>
    </div>
  )
}
