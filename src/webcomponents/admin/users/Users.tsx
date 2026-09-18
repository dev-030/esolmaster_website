"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TabKey, UserTabs } from "./UserTab";
import { User, UserRow } from "./UserRow";
import { Pagination, SectionHeading } from "@/webcomponents/reusable";
import { DeleteDialog } from "@/webcomponents/sameroute/class/dialogs";
import { useGetAdminUsersQuery } from "@/api/admin/query";
import { getAdminUsers } from "@/api/admin/api";
import { Loader2, Search, X, Users as UsersIcon, GraduationCap, BookOpen, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 6;

// Helper function to transform API response to User interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformApiUser = (apiUser: any): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  avatar: apiUser.avatarUrl,
  role: apiUser.role === "teacher" ? "Teacher" : apiUser.role === "student" ? "Student" : "Admin",
  subscription: apiUser.subscription ?? (apiUser.role === "teacher" ? { planName: "Free", planType: "FREE" } : null),
  status: apiUser.isActive ? "Active" : "Inactive",
  joined: new Date(apiUser.joinedAt).toISOString().split('T')[0], // yyyy-mm-dd
  lastActive: apiUser.lastActive 
    ? getTimeAgo(new Date(apiUser.lastActive))
    : "Never",
  relatedInfo: apiUser.relatedInfo
});

// Helper function to get time ago string
const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return "Just now";
};

export const Users = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [cachedSummary, setCachedSummary] = useState<any>(null);

  // Debounce search input by 250ms to keep input responsive while avoiding spam requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prefetch tabs on initial render so switching between All, Students, and Teachers is instant
  useEffect(() => {
    if (!debouncedSearch) {
      queryClient.prefetchQuery({
        queryKey: ['adminUsers', { page: 1, limit: PAGE_SIZE, role: undefined, search: undefined }],
        queryFn: () => getAdminUsers({ page: 1, limit: PAGE_SIZE }),
        staleTime: 1000 * 60 * 3,
      });
      queryClient.prefetchQuery({
        queryKey: ['adminUsers', { page: 1, limit: PAGE_SIZE, role: 'student', search: undefined }],
        queryFn: () => getAdminUsers({ page: 1, limit: PAGE_SIZE, role: 'student' }),
        staleTime: 1000 * 60 * 3,
      });
      queryClient.prefetchQuery({
        queryKey: ['adminUsers', { page: 1, limit: PAGE_SIZE, role: 'teacher', search: undefined }],
        queryFn: () => getAdminUsers({ page: 1, limit: PAGE_SIZE, role: 'teacher' }),
        staleTime: 1000 * 60 * 3,
      });
    }
  }, [queryClient, debouncedSearch]);
  
  // Get role filter based on active tab
  const getRoleFilter = (): "teacher" | "student" | "admin" | undefined => {
    if (activeTab === "Students") return "student";
    if (activeTab === "Teachers") return "teacher";
    return undefined;
  };
  
  // Fetch users from API
  const { 
    data: apiResponse, 
    isLoading, 
    isFetching,
    isError,
    refetch 
  } = useGetAdminUsersQuery({ 
    page, 
    limit: PAGE_SIZE,
    role: getRoleFilter(),
    search: debouncedSearch || undefined
  });

  // Preserve global summary across all tabs
  useEffect(() => {
    if (apiResponse?.summary) {
      setCachedSummary(apiResponse.summary);
    }
  }, [apiResponse?.summary]);

  const summary = apiResponse?.summary || cachedSummary;
  
  // Transform API data to User interface
  const users: User[] = apiResponse?.data?.map(transformApiUser) || [];
  const meta = apiResponse?.meta;
  const totalItems = meta?.total || 0;  
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when tab changes
  };
  
  const handleView = (user: User) => {
    // Implement view logic - could open a modal or navigate to user details
    console.log("View user:", user);
  };
  
  // Error state
  if (isError && !apiResponse && !summary) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeading
          heading="User Management"
          subheading="Manage learner and instructor accounts, role permissions, and platform activity."
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80">
          <UserTabs active={activeTab} onChange={handleTabChange} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200/70 shadow-none p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
            <p className="text-xs sm:text-[13px] font-medium">Failed to load users</p>
            <button 
              onClick={() => refetch()}
              className="text-xs sm:text-[13px] font-medium text-primary hover:text-primary/90 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        heading="User Management"
        subheading="Manage learner and instructor accounts, role permissions, and platform activity."
      />

      {/* Stats Summary - Skeletons during load, then persistent static values */}
      {summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-none flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Total Users</span>
              <span className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                {summary.totalUsers}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-600 shrink-0">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>

          {/* Students */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-none flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Students</span>
              <span className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                {summary.totalStudents}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          {/* Teachers */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-none flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Teachers</span>
              <span className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                {summary.totalTeachers}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-none flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Active Users</span>
              <span className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                {summary.activeUsers}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/70 p-4 sm:p-5 shadow-none flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-16 bg-slate-100" />
                <Skeleton className="h-7 w-12 bg-slate-100" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg bg-slate-100 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80">
        <UserTabs active={activeTab} onChange={handleTabChange} />
        <div className="pb-2.5 sm:pb-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="h-9 pl-9 pr-8 text-xs sm:text-[13px] rounded-lg border border-slate-200/80 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors shadow-none w-full sm:w-64"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/70 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[
                  "User",
                  "Role",
                  "Plan",
                  "Status",
                  "Joined",
                  "Last Active",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 sm:px-5 text-left text-xs font-semibold text-slate-600 tracking-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isLoading || (isFetching && users.length === 0)) ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="border-b border-slate-100/80">
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-slate-100 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3.5 w-28 bg-slate-100" />
                          <Skeleton className="h-3 w-36 bg-slate-100" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-5 w-14 rounded-md bg-slate-100" />
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-5 w-16 rounded-md bg-slate-100" />
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-3.5 w-20 bg-slate-100" />
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-3.5 w-16 bg-slate-100" />
                    </td>
                    <td className="py-3 sm:py-3.5 px-4 sm:px-5">
                      <Skeleton className="h-7 w-7 rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-xs sm:text-[13px] text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onView={handleView}
                    onDelete={(u) => setDeleteTarget(u)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalItems > PAGE_SIZE && (
          <div className="border-t border-slate-100">
            <Pagination
              page={page}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              className="border-t-0 bg-white"
            />
          </div>
        )}
      </div>
      
      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
        }}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={() => {
          // Implement delete logic here
          console.log("Delete user:", deleteTarget);
          setDeleteTarget(null);
        }}
        // loading={deleteUserMutation.isPending}
      />
    </div>
  );
};