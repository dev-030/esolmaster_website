import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, CircleCheck, CircleMinus, Eye, GraduationCap, MoreHorizontal, ShieldCheck, Trash2, Zap, Star, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: "Student" | "Teacher" | "Admin"
  subscription?: {
    planName: string;
    planType: string;
    billingCycle?: string;
    billingStatus?: string;
  } | null
  status: "Active" | "Inactive"
  joined: string       // yyyy-mm-dd
  lastActive: string   // time-ago string or "Never"
  relatedInfo?: {
    username?: string
    level?: number
    totalXp?: number
    subject?: string
    institution?: string
    enrolledClasses?: number
    tasksCreated?: number
  }
}

const roleConfig: Record<User["role"], { label: string; icon: React.ReactNode; className: string }> = {
  Student: {
    label: "Student",
    icon: <GraduationCap size={13} className="text-primary" />,
    className: "bg-primary/10 text-primary border-primary/25",
  },
  Teacher: {
    label: "Teacher",
    icon: <BookOpen size={13} className="text-slate-600" />,
    className: "bg-slate-100 text-slate-700 border-slate-200/70",
  },
  Admin: {
    label: "Admin",
    icon: <ShieldCheck size={13} className="text-amber-700" />,
    className: "bg-amber-50/80 text-amber-700 border-amber-200/70",
  },
}

const statusConfig: Record<User["status"], { icon: React.ReactNode; className: string }> = {
  Active:   { icon: <CircleCheck size={13} className="text-emerald-600" />,  className: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  Inactive: { icon: <CircleMinus size={13} className="text-slate-400" />,  className: "bg-slate-100 text-slate-500 border-slate-200/60" },
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export const UserRow = ({
  user,
  onView,
  onDelete,
}: {
  user: User
  onView: (u: User) => void
  onDelete: (u: User) => void
}) => {
  const role = roleConfig[user.role]
  const status = statusConfig[user.status]
  const router = useRouter();

  return (
    <tr className="border-b border-slate-100/80 hover:bg-slate-50/60 transition-colors">
      {/* User */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-900 truncate">{user.name}</span>
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
            {/* Show additional info for teachers/students */}
            {user.relatedInfo && (
              <span className="text-[11px] text-slate-400 mt-0.5 font-normal">
                {user.role === "Student" && user.relatedInfo.level && `Level ${user.relatedInfo.level}`}
                {user.role === "Teacher" && user.relatedInfo.subject && user.relatedInfo.subject}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-md border ${role.className}`}
        >
          {role.icon}
          {role.label}
        </span>
      </td>

      {/* Plan / Subscription */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        {user.role === "Teacher" ? (
          user.subscription?.planType === "PRO" ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border bg-indigo-50 text-indigo-700 border-indigo-200/60">
              <Zap size={11} className="text-indigo-600" />
              Pro
            </span>
          ) : user.subscription?.planType === "BASIC" ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border bg-blue-50 text-blue-700 border-blue-200/60">
              <Star size={11} className="text-blue-600" />
              Basic
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md border bg-slate-100 text-slate-600 border-slate-200/60">
              <Shield size={11} className="text-slate-500" />
              Free
            </span>
          )
        ) : (
          <span className="text-xs text-slate-400 font-normal">—</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-md border ${status.className}`}
        >
          {status.icon}
          {user.status}
        </span>
      </td>

      {/* Joined */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        <span className="text-xs sm:text-[13px] text-slate-600 font-normal">{user.joined}</span>
      </td>

      {/* Last Active */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        <span className="text-xs sm:text-[13px] text-slate-500 font-normal">{user.lastActive}</span>
      </td>

      {/* Actions */}
      <td className="py-3 sm:py-3.5 px-4 sm:px-5">
        {user.role === "Admin" ? (
          <span className="text-xs text-slate-400 font-normal px-2">—</span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 text-slate-400 hover:text-primary transition-colors cursor-pointer outline-none shadow-none">
              <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-xl border border-slate-200/80 bg-white shadow-none p-1">
              <DropdownMenuItem
                onClick={() => router.push(`/users/${user.id}`)}
                className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer px-2.5 py-1.5"
              >
                <Eye size={14} className="text-slate-400" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="flex items-center gap-2 text-xs sm:text-[13px] font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer px-2.5 py-1.5"
              >
                <Trash2 size={14} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  )
}