"use client";

import { toast } from "sonner";
import { DeleteDialog } from "../dialogs";
import {
  Search,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { StudentRow } from "./StudentRow";
import { InviteStudentDialog } from "./InviteStudent";
import {
  useGetStudentsInClassQuery,
  useGetClassByIdQuery,
  useRegenerateClassJoinCodeMutation,
  useRemoveStudentsFromClassMutation,
  useUpdateClassJoinStatusMutation,
} from "@/api/class";

const JoinCodeCardSkeleton = () => (
  <div className="rounded-[20px] border border-slate-200 bg-white p-5 animate-pulse">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 shrink-0 rounded-[14px] bg-slate-100" />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded-md bg-slate-200/70" />
            <div className="h-4 w-12 rounded-full bg-slate-100" />
          </div>
          <div className="h-3 w-56 rounded-md bg-slate-100" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="h-8 w-28 rounded-[12px] bg-slate-100" />
        <div className="h-8 w-24 rounded-[10px] bg-slate-100" />
        <div className="h-8 w-24 rounded-[10px] bg-slate-100" />
        <div className="h-8 w-32 rounded-[10px] bg-slate-200/70 ml-auto sm:ml-0" />
      </div>
    </div>
  </div>
);

const ClassRosterTableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-slate-100 bg-slate-50/50">
          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Student
          </th>
          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
            Email
          </th>
          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
            Username
          </th>
          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
            Joined
          </th>
          <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Progress
          </th>
          <th className="px-5 py-3 w-12" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="bg-white">
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded-md bg-slate-200/70" />
                  <div className="h-2.5 w-16 rounded-md bg-slate-100" />
                </div>
              </div>
            </td>
            <td className="px-5 py-3.5 hidden md:table-cell">
              <div className="h-3.5 w-36 rounded-md bg-slate-100" />
            </td>
            <td className="px-5 py-3.5 hidden sm:table-cell">
              <div className="h-3.5 w-20 rounded-md bg-slate-100" />
            </td>
            <td className="px-5 py-3.5 hidden lg:table-cell">
              <div className="h-3.5 w-20 rounded-md bg-slate-100" />
            </td>
            <td className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-28 rounded-full bg-slate-100" />
                <div className="h-3 w-7 rounded-md bg-slate-100" />
              </div>
            </td>
            <td className="px-5 py-3.5 text-right">
              <div className="h-7 w-7 rounded-lg bg-slate-100 ml-auto" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const StudentClassPage = () => {
  const { classId } = useParams<{ classId: string }>();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: string;
    name?: string;
  }>({ open: false });
  const [isRemoving, setIsRemoving] = useState(false);

  const { data: classDetails, isLoading: isClassLoading, refetch: refetchClass } = useGetClassByIdQuery(classId);
  const { mutateAsync: regenerateJoinCode, isPending: isRegenerating } =
    useRegenerateClassJoinCodeMutation(classId);
  const { mutateAsync: updateJoinStatus, isPending: isUpdatingJoinStatus } =
    useUpdateClassJoinStatusMutation(classId);

  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useGetStudentsInClassQuery(classId, {
    page,
    limit,
    search: debouncedSearch,
  });

  const { mutateAsync: removeStudent } = useRemoveStudentsFromClassMutation(classId);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const students = studentsData?.data || [];
  const total = studentsData?.meta?.total || 0;
  const totalPages = studentsData?.meta?.totalPages || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const joinStatus = classDetails?.joinStatus ?? "OPEN";
  const isJoinOpen = joinStatus === "OPEN";
  const joinStatusLabel = isJoinOpen ? "Open" : "Paused";

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyJoinCode = async () => {
    if (!classDetails?.joinCode) return;
    await navigator.clipboard.writeText(classDetails.joinCode);
    setCopied(true);
    toast.success("Join code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const changeJoinStatus = async (status: "OPEN" | "PAUSED" | "CLOSED") => {
    try {
      await updateJoinStatus(status);
      await refetchClass();
      toast.success(status === "OPEN" ? "Class joining resumed" : "Class joining paused");
    } catch {
      toast.error("Unable to update classroom joining status");
    }
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    try {
      setIsRemoving(true);
      await removeStudent([studentId]);
      toast.success(`${studentName} removed from class`);
      await refetch();
      setDeleteDialog({ open: false });
    } catch (error) {
      toast.error("Failed to remove student");
      throw error;
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Class Join Code Card */}
      {isClassLoading || !classDetails ? (
        <JoinCodeCardSkeleton />
      ) : (
        <div className="rounded-[20px] border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Info */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-blue-50 text-[#3454FB]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">Class Join Code</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isJoinOpen
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-700 border border-amber-200/60"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isJoinOpen
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-500"
                      }`}
                    />
                    {joinStatusLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Share this code with students to let them join directly.
                </p>
              </div>
            </div>

            {/* Code Pill + Controls */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Monospace Code Pill */}
              <div className="flex items-center gap-2 rounded-[12px] border border-blue-100 bg-blue-50/40 px-3.5 py-1.5">
                <span className="font-mono text-sm font-bold tracking-[0.2em] text-[#3454FB]">
                  {classDetails.joinCode || "------"}
                </span>
                <button
                  type="button"
                  onClick={copyJoinCode}
                  className="rounded-md p-1 text-slate-400 hover:text-[#3454FB] hover:bg-white transition-colors"
                  title="Copy join code"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Status Control (Single Toggle: Pause / Resume) */}
              {joinStatus === "OPEN" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeJoinStatus("PAUSED")}
                  disabled={isUpdatingJoinStatus}
                  className="rounded-[10px] text-xs font-semibold h-8 border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-none"
                >
                  <Pause className="mr-1.5 h-3.5 w-3.5" /> Pause joins
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => changeJoinStatus("OPEN")}
                  disabled={isUpdatingJoinStatus}
                  className="rounded-[10px] text-xs font-semibold h-8 bg-[#3454FB] hover:bg-[#2842D8] text-white shadow-none"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" /> Resume joins
                </Button>
              )}

              {/* Regenerate */}
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await regenerateJoinCode();
                  await refetchClass();
                  toast.success("Join code regenerated");
                }}
                disabled={isRegenerating}
                className="rounded-[10px] text-xs font-semibold h-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>

              {/* Invite Student Button */}
              <Button
                onClick={() => setInviteOpen(true)}
                className="gap-1.5 bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold rounded-[10px] h-8 px-3 text-xs shadow-none transition-all ml-auto sm:ml-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite Student
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Class Roster Table Card */}
      <div className="rounded-[20px] border border-slate-200 bg-white overflow-hidden">
        {/* Table Card Header with Search */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Class Roster</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage student enrollments and monitor individual activity progress
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs rounded-[12px] border-slate-200 bg-slate-50/60 focus:bg-white focus:border-[#3454FB] transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <ClassRosterTableSkeleton />
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#3454FB]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">No students found</p>
              <p className="text-xs text-slate-400 mt-1">
                {debouncedSearch
                  ? "Try a different search keyword."
                  : "Invite students to get started with this classroom."}
              </p>
            </div>
            {!debouncedSearch && (
              <Button
                onClick={() => setInviteOpen(true)}
                className="gap-2 mt-2 bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold rounded-[12px] text-xs h-8 px-4"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite First Student
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                      Username
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-5 py-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                      onRemove={() =>
                        setDeleteDialog({
                          open: true,
                          id: student.id,
                          name: `${student.firstName} ${student.lastName}`,
                        })
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
                <div className="text-xs text-slate-400 font-medium">
                  Showing <strong className="text-slate-700">{startItem}</strong> to{" "}
                  <strong className="text-slate-700">{endItem}</strong> of{" "}
                  <strong className="text-slate-700">{total}</strong> students
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="gap-1 rounded-[10px] text-xs h-8 border-slate-200"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                        if (i === 4) pageNum = totalPages;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                        if (i === 3 && totalPages > 5) {
                          return (
                            <span
                              key={`ellipsis-${i}`}
                              className="px-2.5 py-1 text-slate-400 text-xs flex items-center"
                            >
                              ...
                            </span>
                          );
                        }
                        if (i === 4) pageNum = totalPages;
                      }

                      if (pageNum === undefined) return null;

                      const isCurrent = page === pageNum;
                      return (
                        <Button
                          key={pageNum}
                          variant={isCurrent ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-8 h-8 rounded-[10px] text-xs font-semibold ${
                            isCurrent
                              ? "bg-[#3454FB] hover:bg-[#2842D8] text-white border-[#3454FB]"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="gap-1 rounded-[10px] text-xs h-8 border-slate-200"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <InviteStudentDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(v) => setDeleteDialog((s) => ({ ...s, open: v }))}
        title={`Remove "${deleteDialog.name}"?`}
        description="The student will lose access to this class and all its tasks. This action cannot be undone."
        onConfirm={() => {
          if (deleteDialog.id && !isRemoving) {
            return handleRemoveStudent(
              deleteDialog.id,
              deleteDialog.name || "Student",
            );
          }
        }}
        loading={isRemoving}
      />
    </div>
  );
};
