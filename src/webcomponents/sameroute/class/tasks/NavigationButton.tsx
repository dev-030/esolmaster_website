"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface NavigationButtonsProps {
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const NavigationButtons = ({
  isFirst, isLast, canProceed, onPrev, onNext, onSubmit, isSubmitting = false,
}: NavigationButtonsProps) => {
  return (
    <div className="flex items-center justify-between pt-5 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        disabled={isFirst || isSubmitting}
        className="gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {isLast ? (
        <Button
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <CheckCircle className="w-4 h-4" />}
          {isSubmitting ? "Saving…" : "Submit Task"}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed || isSubmitting}
          className="gap-1.5"
        >
          {isSubmitting ? "Saving…" : "Next"}
          {isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ArrowRight className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
}
