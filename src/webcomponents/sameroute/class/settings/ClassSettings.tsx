"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, ClipboardList, Pencil, Settings, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useDeleteClassMutation, useGetClassByIdQuery, useUpdateClassMutation } from "@/api/class";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Class, CreateClassPayload } from "@/types/class";
import { ClassDialog, DeleteDialog } from "../dialogs";
import { InfoRow } from "./InfoRow";

export const ClassSettings = () => {
  const { classId } = useParams<{ classId: string }>();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: cls } = useGetClassByIdQuery(classId);
  const { mutateAsync: updateClass } = useUpdateClassMutation();
  const { mutateAsync: deleteClass, isPending: isDeleting } = useDeleteClassMutation();

  if (!cls) {
    return <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">Loading class settings…</div>;
  }

  const handleUpdate = async (payload: CreateClassPayload) => {
    try {
      await updateClass({ id: classId, payload });
      toast.success("Class details updated");
    } catch (error: unknown) {
      toast.error(isAxiosError(error) ? error.response?.data?.message || "Unable to update class" : "Unable to update class");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClass(classId);
      toast.success("Class deleted");
      router.replace("/classes");
    } catch (error: unknown) {
      toast.error(isAxiosError(error) ? error.response?.data?.message || "Unable to delete class" : "Unable to delete class");
      throw error;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-blue-600" />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Class settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage the details students see.</p>
        </div>
      </div>

      <Card className="rounded-[20px] border border-slate-100/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 gap-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-[14px] text-lg font-black text-white shadow-sm"
              style={{ backgroundColor: cls.color || "#3454FB" }}
            >
              {cls.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 tracking-tight">{cls.name}</p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-0.5">
                <BookOpen className="h-3.5 w-3.5 text-[#3454FB]" /> {cls.subject}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-[10px] text-xs font-semibold h-8 border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit details
          </Button>
        </div>

          <Separator className="my-5" />

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Teacher" value={cls.teacherName} />
            <InfoRow label="Maximum students" value={String(cls.maxStudents)} />
            <InfoRow label="Created" value={new Date(cls.createdAt).toLocaleDateString()} />
            <InfoRow label="Description" value={cls.description || "No description"} className="sm:col-span-2 lg:col-span-3" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 p-3 text-sm text-slate-700">
              <Users className="h-4 w-4 text-[#3454FB]" /> <strong>{cls.studentCount}</strong> students enrolled
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 p-3 text-sm text-slate-700">
              <ClipboardList className="h-4 w-4 text-[#3454FB]" /> <strong>{cls.taskCount}</strong> activities assigned
            </div>
          </div>
      </Card>

      <div className="rounded-[20px] border border-red-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Delete classroom</p>
              <p className="text-xs text-slate-400 mt-0.5">Removes the classroom, assignments, and student enrolment permanently.</p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="rounded-[10px] text-xs font-semibold h-8 px-3"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete class
          </Button>
        </div>
      </div>

      <ClassDialog open={editOpen} onOpenChange={setEditOpen} initial={cls as Class} onSave={handleUpdate} />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${cls.name}"?`}
        description="This permanently removes the class, its assignments, and all student enrolment. This action cannot be undone."
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
};
