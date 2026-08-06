"use client";

import { useState } from "react";
import { TabKey, UserTabs } from "./UserTab";
import { User, UserRow } from "./UserRow";
import { Pagination } from "@/webcomponents/reusable";
import { DeleteDialog } from "@/webcomponents/sameroute/class/dialogs";
import { useGetAdminUsersQuery } from "@/api/admin/query";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 6;

// Helper function to transform API response to User interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformApiUser = (apiUser: any): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  avatar: apiUser.avatarUrl,
  role: apiUser.role === "teacher" ? "Teacher" : apiUser.role === "student" ? "Student" : "Admin",
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
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  
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
    isError,
    refetch 
  } = useGetAdminUsersQuery({ 
    page, 
    limit: PAGE_SIZE,
    role: getRoleFilter(),
    search: searchTerm || undefined
  });
  
  // Delete mutation
  
  // Transform API data to User interface
  const users: User[] = apiResponse?.data?.map(transformApiUser) || [];
  const meta = apiResponse?.meta;
  const totalItems = meta?.total || 0;  
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when tab changes
  };
  
  // const handleDelete = async () => {
  //   if (!deleteTarget) return;
    
  //   try {
  //     await deleteUserMutation.mutateAsync(deleteTarget.id);
  //     // Refetch to update the list
  //     refetch();
  //     setDeleteTarget(null);
  //   } catch (error) {
  //     console.error("Failed to delete user:", error);
  //   }
  // };
  
  const handleView = (user: User) => {
    // Implement view logic - could open a modal or navigate to user details
    console.log("View user:", user);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <UserTabs active={activeTab} onChange={handleTabChange} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className="flex flex-col gap-6">
        <UserTabs active={activeTab} onChange={handleTabChange} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
            <p>Failed to load users</p>
            <button 
              onClick={() => refetch()}
              className="text-sm text-blue-600 hover:text-blue-800"
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
      {/* Search Bar - Optional addition */}
      <div className="flex justify-between items-center">
        <UserTabs active={activeTab} onChange={handleTabChange} />
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset to first page on search
            }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      
      {/* Stats Summary - Optional */}
      {apiResponse?.summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-800">{apiResponse.summary.totalUsers}</div>
            <div className="text-xs text-gray-500">Total Users</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{apiResponse.summary.totalStudents}</div>
            <div className="text-xs text-gray-500">Students</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{apiResponse.summary.totalTeachers}</div>
            <div className="text-xs text-gray-500">Teachers</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{apiResponse.summary.activeUsers}</div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {[
                  "User",
                  "Role",
                  "Status",
                  "Joined",
                  "Last Active",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
               </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-400"
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
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
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