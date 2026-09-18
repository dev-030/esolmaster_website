"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Mail, MoreHorizontal, Eye, School, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/webcomponents/reusable";
import { SectionHeading } from "@/webcomponents/reusable";
import { useGetStudentReportQuery } from "@/api/analytics";

// ── Config ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function getStatusColor(status: string) {
  switch (status) {
    case "GOOD":      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "NORMAL":    return "bg-primary/5 text-primary border-primary/20";
    case "PROBLEMATIC": return "bg-red-50 text-red-700 border-red-200";
    default:          return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "GOOD":      return "bg-emerald-500";
    case "NORMAL":    return "bg-primary";
    case "PROBLEMATIC": return "bg-red-500";
    default:          return "bg-slate-400";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "GOOD":      return "Good";
    case "NORMAL":    return "Normal";
    case "PROBLEMATIC": return "At Risk";
    default:          return status;
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-5">
      {/* Search bar skeleton */}
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-4">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-slate-200/70 overflow-hidden shadow-none">
        <div className="bg-slate-50 border-b border-slate-200/70 px-4 py-3 flex gap-4">
          {[200, 120, 100, 80, 80, 60].map((w, i) => (
            <Skeleton key={i} className={`h-3 rounded`} style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-100 last:border-0">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
            <Skeleton className="h-3.5 w-28 rounded hidden sm:block" />
            <Skeleton className="h-5 w-12 rounded-full hidden md:block" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-7 w-7 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export const StudentsTeacher = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const { data: response, isLoading } = useGetStudentReportQuery({ 
    search, 
    page, 
    limit: PAGE_SIZE 
  });

  const students = response?.data || [];
  const paginationMeta = response?.meta;

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <SectionHeading
        heading="Students"
        subheading="Monitor progress, scores, and activity for all your students."
      />

      {/* Search */}
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-none p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name, email or class…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 rounded-lg border-blue-100 bg-blue-50/30 hover:bg-blue-50/50 hover:border-[#007EEF]/40 focus:bg-white focus:border-[#007EEF] focus-visible:border-[#007EEF] focus-visible:ring-3 focus-visible:ring-[#007EEF]/15 shadow-none text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/70 overflow-hidden shadow-none bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200/70">
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 pl-4">
                Student Name
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3">
                Class
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 text-center">
                Tasks
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 text-center">
                Avg Score
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide py-3 pr-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No students found</p>
                    {search && <p className="text-xs text-slate-400">Try a different search term</p>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow
                  key={student.studentId}
                  className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0"
                >
                  {/* Name */}
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                          {initials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{student.name}</p>
                        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Class */}
                  <TableCell className="py-3">
                    {student.connectedClasses.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <School className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate max-w-[140px]">{student.connectedClasses[0].name}</span>
                        </span>
                        {student.connectedClasses.length > 1 && (
                          <span className="text-[10px] text-slate-400 pl-5">
                            +{student.connectedClasses.length - 1} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No class</span>
                    )}
                  </TableCell>

                  {/* Tasks */}
                  <TableCell className="py-3 text-center">
                    <span className="text-sm font-bold text-slate-800">
                      {student.completedTasks}
                      <span className="text-slate-400 font-normal text-xs">/{student.totalScheduledTasks}</span>
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{student.inProgressTasks} in progress</div>
                  </TableCell>

                  {/* Avg Score */}
                  <TableCell className="py-3 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                      {Math.round(student.avgScore)}%
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Progress: {Math.round(student.progressPercentage)}%
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border",
                      getStatusColor(student.status)
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", getStatusDot(student.status))} />
                      {getStatusLabel(student.status)}
                    </span>
                    {student.lastAttemptAt && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Last: {new Date(student.lastAttemptAt).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-slate-500 hover:bg-primary/5 hover:text-primary transition-colors outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 shadow-none border-slate-200/70">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-xs"
                          onClick={() => router.push(`/students/${student.studentId}`)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <Pagination
            page={page}
            totalItems={paginationMeta.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};