"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, BookOpen, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRole } from "@/provider/RoleProvider";
import { useTeacherSubscription } from "@/provider/SubscriptionProvider";
import { ClassCard, EmptyState, SectionHeading } from "@/webcomponents/reusable";
import { ClassDialog, DeleteDialog } from "./dialogs";
import {
  useCreateClassMutation,
  useDeleteClassMutation,
  useGetClassesQuery,
  useJoinClassMutation,
  useUpdateClassMutation,
} from "@/api/class";
import { Class as ClassRoom, CreateClassPayload } from "@/types/class";

export const Class = () => {
  const { role } = useRole();
  const { planType, limits, canCreateClass, openUpgradeModal } = useTeacherSubscription();
  const [page, setPage] = useState(1);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const limit = 10;

  const { mutateAsync: createClass } = useCreateClassMutation();
  const { mutateAsync: updateClassMutation } = useUpdateClassMutation();
  const { data: classesData, refetch, isLoading } = useGetClassesQuery({
    page,
    limit,
  });
  const { mutateAsync: deleteClassMutation } = useDeleteClassMutation();
  const { mutateAsync: joinClass, isPending: isJoining } = useJoinClassMutation();

  const [classDialog, setClassDialog] = useState<{
    open: boolean;
    initial?: ClassRoom | null;
  }>({ open: false });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id?: string;
    name?: string;
  }>({ open: false });

  const isTeacher = role === "teacher";

  // Calculate pagination values
  const totalItems = classesData?.meta?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddClass = async (cls: CreateClassPayload) => {
    try {
      await createClass(cls);
      await refetch();
      toast.success("Class created");
    } catch (error) {
      toast.error("Failed to create class");
      throw error;
    }
  };

  const handleUpdateClass = async (
    cls: Omit<CreateClassPayload, "taskIds">,
  ) => {
    if (!classDialog.initial?.id) return;
    try {
      await updateClassMutation({ id: classDialog.initial.id, payload: cls });
      await refetch();
      toast.success("Class updated");
    } catch (error) {
      toast.error("Failed to update class");
      throw error;
    }
  };

  const handleJoinClass = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = joinCode.trim();
    try {
      await joinClass(code);
      setJoinCode("");
      setJoinOpen(false);
      toast.success("You joined the class");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to join class");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeading
        heading={isTeacher ? "My Classes" : "Classes"}
        subheading={
          isTeacher
            ? `${totalItems} of ${limits.maxClasses} classes used (${planType} Plan)`
            : `${totalItems} class${totalItems !== 1 ? "es" : ""} enrolled`
        }
        action={
          isTeacher ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/70">
                {totalItems} / {limits.maxClasses} Classes Used
              </span>
              <Button
                onClick={() => {
                  if (!canCreateClass) {
                    openUpgradeModal(
                      "Class Limit Reached",
                      `You have reached your limit of ${limits.maxClasses} classes on the ${planType} plan. Upgrade to Basic or Pro to create more classrooms.`
                    );
                    return;
                  }
                  setClassDialog({ open: true, initial: null });
                }}
                className="gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white font-semibold rounded-xl h-9 px-4 text-xs border-none shadow-none cursor-pointer"
                style={{ boxShadow: "none" }}
              >
                <Plus className="w-4 h-4" />
                New Class
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setJoinOpen(true)}
              className="gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white font-semibold rounded-xl h-9 px-4 text-xs border-none shadow-none"
              style={{ boxShadow: "none" }}
            >
              <LogIn className="w-4 h-4" />
              Join Class
            </Button>
          )
        }
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/70 bg-white shadow-none overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-3 bg-slate-100/70 min-h-[104px]">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-36 rounded" />
              </div>
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2.5">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : classesData?.data.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-muted-foreground" />}
          title="No classes yet"
          description={
            isTeacher
              ? "Create your first class to get started."
              : "You haven't been enrolled in any classes yet."
          }
          action={
            isTeacher ? (
              <Button
                onClick={() => setClassDialog({ open: true, initial: null })}
                className="gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white font-semibold rounded-xl h-9 px-4 text-xs border-none shadow-none"
                style={{ boxShadow: "none" }}
              >
                <Plus className="w-4 h-4" /> New Class
              </Button>
            ) : (
              <Button
                onClick={() => setJoinOpen(true)}
                className="gap-2 bg-[#007EEF] hover:bg-[#0066cc] text-white font-semibold rounded-xl h-9 px-4 text-xs border-none shadow-none"
                style={{ boxShadow: "none" }}
              >
                <LogIn className="w-4 h-4" /> Join Class
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
            {classesData?.data.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                role={role as "teacher" | "student" | "admin"}
                isTeacher={isTeacher}
                onEdit={() => setClassDialog({ open: true, initial: cls })}
                onDelete={() =>
                  setDeleteDialog({ open: true, id: cls.id, name: cls.name })
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startItem} to {endItem} of {totalItems} classes
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                      if (i === 4) pageNum = totalPages;
                    }
                    
                    if (pageNum === undefined) return null;
                    
                    if (pageNum === -1 || (i === 3 && totalPages > 5 && page < totalPages - 2 && page > 3)) {
                      return (
                        <span key={`ellipsis-${i}`} className="px-3 py-2">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="min-w-10"
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
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join a classroom</DialogTitle>
            <DialogDescription>
              Enter the code shared by your teacher.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class-join-code">Class code</Label>
              <Input
                id="class-join-code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={8}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setJoinOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isJoining || joinCode.trim().length < 6}>
                {isJoining ? "Joining..." : "Join classroom"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <ClassDialog
        open={classDialog.open}
        onOpenChange={(v) => setClassDialog((s) => ({ ...s, open: v }))}
        initial={classDialog.initial}
        onSave={(cls) =>
          classDialog.initial ? handleUpdateClass(cls) : handleAddClass(cls)
        }
      />

      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={(v) => setDeleteDialog((s) => ({ ...s, open: v }))}
        title={`Delete "${deleteDialog.name}"?`}
        description="This will permanently remove the class and all its data. This action cannot be undone."
        onConfirm={async () => {
          if (deleteDialog.id) {
            try {
              await deleteClassMutation(deleteDialog.id);
              await refetch();
              toast.success("Class deleted");
            } catch (error) {
              toast.error("Unable to delete class");
              throw error;
            }
          }
        }}
      />
    </div>
  );
};
