import { Task } from "@/types/task"
import { CheckCircle, XCircle } from "lucide-react"


const typeBadgeVariant: Record<Task["type"], string> = {
  GRAMMAR: "bg-purple-100 text-purple-700 border-purple-200",
  READING: "bg-blue-100 text-blue-700 border-blue-200",
  WRITING: "bg-purple-100 text-purple-700 border-purple-200",
  LISTENING: "bg-cyan-100 text-cyan-700 border-cyan-200",
  SPEAKING: "bg-rose-100 text-rose-700 border-rose-200",
  VOCABULARY: "bg-green-100 text-green-700 border-green-200",
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
    <div className="flex items-start justify-between gap-4 py-3">
      {/* Left content */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {/* Row 1: title + badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800 truncate">{task.title}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeBadgeVariant[task.type]}`}
          >
            {task.type}
          </span>
        </div>
        {/* Row 2: description + submitted date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 truncate">{task.status}</span>
          <span className="text-xs text-gray-400 shrink-0">· Submitted {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        {/* Row 3: submitted by */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 shrink-0">
            · Submitted by {task.createdBy.firstName} {task.createdBy.lastName}
          </span>
        </div>
      </div>

      {/* Right: action icons */}
      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        <button
          onClick={() => onReject(task.id)}
          className="text-red-400 hover:text-red-600 transition-colors"
          title="Reject"
        >
          <XCircle size={22} />
        </button>
        <button
          onClick={() => onApprove(task.id)}
          className="text-emerald-400 hover:text-emerald-600 transition-colors"
          title="Approve"
        >
          <CheckCircle size={22} />
        </button>
      </div>
    </div>
  )
}
