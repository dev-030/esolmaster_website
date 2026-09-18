// StudentRow.tsx
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { StudentData } from "@/types/class";

interface StudentRowProps {
  student: StudentData;
  onRemove: () => void;
}

export const StudentRow = ({ student, onRemove }: StudentRowProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const joinedDate = formatDistanceToNow(new Date(student.joinedAt), { addSuffix: true });
  const progressVal = Math.min(Math.max(student.progress?.progressPercentage || 0, 0), 100);

  return (
    <tr className="group hover:bg-slate-50/60 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 rounded-full ring-2 ring-slate-100">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.firstName + " " + student.lastName}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="text-xs font-bold bg-primary/5 text-primary">
                {getInitials(student.firstName + " " + student.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 text-sm tracking-tight truncate">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-xs text-slate-400 md:hidden truncate">
              {student.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 hidden md:table-cell text-slate-500 text-xs font-medium">
        {student.email}
      </td>
      <td className="px-5 py-4 hidden sm:table-cell text-slate-400 font-mono text-xs">
        @{student.username}
      </td>
      <td className="px-5 py-4 hidden lg:table-cell text-slate-400 text-xs">
        {joinedDate}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3 min-w-[120px] max-w-[160px]">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressVal}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-800 whitespace-nowrap tabular-nums">
            {progressVal}%
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 h-8 w-8 transition-colors outline-none">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-md">
            <DropdownMenuItem
              onClick={onRemove}
              className="text-destructive focus:text-destructive focus:bg-destructive/5 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Remove from class
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};