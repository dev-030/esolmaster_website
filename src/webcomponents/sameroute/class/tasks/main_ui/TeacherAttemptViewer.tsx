"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useGetAttemptQuery } from "@/api/attempt";
import { Loader2 } from "lucide-react";
import { ResultScreen } from "../ResultScreen";

interface TeacherAttemptViewerProps {
  attemptId: string | null;
  onClose: () => void;
  studentName: string;
}

export const TeacherAttemptViewer = ({ attemptId, onClose, studentName }: TeacherAttemptViewerProps) => {
  const { data: attempt, isLoading } = useGetAttemptQuery(attemptId as string);

  return (
    <Dialog open={!!attemptId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 rounded-[20px] bg-white shadow-2xl border border-slate-200/80">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">
            {studentName}&apos;s Submission
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Detailed view of the student&apos;s answers, score, and exam breakdown.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !attempt ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Could not load submission details.
          </div>
        ) : (
          <div className="mt-4">
            <ResultScreen result={attempt.result} hideBackButton />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
