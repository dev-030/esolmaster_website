"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />,
        info: <InfoIcon className="w-4 h-4 text-primary shrink-0" />,
        warning: <TriangleAlertIcon className="w-4 h-4 text-amber-600 shrink-0" />,
        error: <OctagonXIcon className="w-4 h-4 text-red-500 shrink-0" />,
        loading: <Loader2Icon className="w-4 h-4 animate-spin text-primary shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-white !text-slate-800 !border-slate-200 !shadow-lg !rounded-xl text-xs font-medium",
          description: "!text-slate-500 text-xs",
          actionButton:
            "!bg-primary !text-white",
          cancelButton:
            "!bg-slate-100 !text-slate-600",
          error:
            "!bg-white !text-slate-800 !border-red-200/80",
          success:
            "!bg-white !text-slate-800 !border-emerald-200/80",
          warning:
            "!bg-white !text-slate-800 !border-amber-200/80",
          info:
            "!bg-white !text-slate-800 !border-primary/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
