import React from "react";
import { cn } from "@/lib/utils";

export const SectionHeading = ({
  heading,
  subheading,
  className = "",
  headingClassName,
  subheadingClassName,
  action,
}: {
  heading: string;
  subheading?: string;
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  action?: React.ReactNode;
}) => (
  <div className={cn("flex items-start justify-between", className)}>
    <div>
      <h1 className={cn("text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight", headingClassName)}>
        {heading}
      </h1>
      {subheading && (
        <p className={cn("text-xs sm:text-[13px] text-slate-500 mt-1 font-normal", subheadingClassName)}>
          {subheading}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);