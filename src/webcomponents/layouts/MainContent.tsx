"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MainContentProps {
  children: React.ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  const pathname = usePathname();
  const isFullBleed = pathname?.startsWith("/assign-task/preview");

  return (
    <main
      className={cn(
        "flex-1 min-w-0",
        isFullBleed
          ? "overflow-hidden p-0"
          : "overflow-y-auto p-4 sm:p-6",
      )}
    >
      {children}
    </main>
  );
};
