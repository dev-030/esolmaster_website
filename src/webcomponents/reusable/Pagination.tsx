"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;           // current page (1-based)
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-muted/50 rounded-b-lg border-t",
        className
      )}
    >
      {/* Range label */}
      <span className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{from}–{to}</span>
        {" "}of{" "}
        <span className="font-semibold text-foreground">{totalItems}</span>
      </span>

      {/* Prev / Next */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="gap-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 h-8 px-3 text-xs font-medium rounded-xl"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="gap-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 h-8 px-3 text-xs font-medium rounded-xl"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}