"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskRunner } from "@/webcomponents/sameroute/class/tasks/TaskRunner";

export default function PreviewTaskPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();

  if (!params?.taskId) {
    return <div>Invalid task ID</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 min-h-screen">
      <div className="flex items-center justify-between bg-amber-100 text-amber-900 p-4 rounded-xl border border-amber-200">
        <div className="flex flex-col gap-1">
          <span className="font-bold">Preview Mode</span>
          <span className="text-sm opacity-90">
            You are viewing this task exactly as a student would. Answers will be evaluated upon completion.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white hover:bg-slate-50 text-amber-900 border-amber-300 whitespace-nowrap"
          onClick={() => router.push(`/assign-task?taskId=${params.taskId}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Preview
        </Button>
      </div>

      <TaskRunner />
    </div>
  );
}
