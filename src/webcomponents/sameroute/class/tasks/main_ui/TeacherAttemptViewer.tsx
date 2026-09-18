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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{studentName}&apos;s Submission</DialogTitle>
          <DialogDescription>
            Detailed view of the student&apos;s answers and score.
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
