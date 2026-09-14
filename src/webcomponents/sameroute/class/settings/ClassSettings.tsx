"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, ClipboardList, Pencil, Settings, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useDeleteClassMutation, useGetClassByIdQuery, useUpdateClassMutation } from "@/api/class";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card className="gap-0 py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Class information</CardTitle>
              <CardDescription className="mt-1">Name, subject, colour, and classroom capacity.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm" style={{ backgroundColor: cls.color }}>
              {cls.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{cls.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-slate-500"><BookOpen className="h-3.5 w-3.5" /> {cls.subject}</p>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow label="Teacher" value={cls.teacherName} />
            <InfoRow label="Maximum students" value={String(cls.maxStudents)} />
            <InfoRow label="Created" value={new Date(cls.createdAt).toLocaleDateString()} />
            <InfoRow label="Description" value={cls.description || "No description"} className="sm:col-span-2 lg:col-span-3" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
              <Users className="h-4 w-4 text-blue-600" /> <strong>{cls.studentCount}</strong> students enrolled
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-3 text-sm text-slate-700">
              <ClipboardList className="h-4 w-4 text-blue-600" /> <strong>{cls.taskCount}</strong> activities assigned
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 border-red-200 py-0 shadow-none">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-4 w-4" /></div>
            <div>
              <p className="font-semibold text-slate-900">Delete classroom</p>
              <p className="mt-0.5 text-sm text-slate-500">Removes the classroom, assignments, and enrolment permanently.</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-1.5 h-4 w-4" /> Delete class</Button>
        </CardContent>
      </Card>

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
