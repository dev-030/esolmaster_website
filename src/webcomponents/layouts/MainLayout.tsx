"use client";
import { useRole } from "@/provider/RoleProvider";
import { Navbar, Sidebar } from "../ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { role, isLoading } = useRole();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there is no role, redirect to login
    if (!isLoading && !role) {
      router.push("/login");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <p className="text-slate-400 text-sm font-medium">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  // If no role but not loading anymore, don't render content to avoid layout shift
  if (!role) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
};
