"use client";

import { useState } from "react";
import { SectionHeading } from "@/webcomponents/reusable";
import { School, Users, User, Folder, FolderPlus, ChevronRight, Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { useRole } from "@/provider/RoleProvider";
import { useGetTasks } from "@/api/task";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useGetFolders, useGetFolderById, useCreateFolderMutation, useUpdateFolderMutation, useDeleteFolderMutation } from "@/api/folder";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Criteria } from "./Criteria";

export const MyTask = () => {
  const { role, user } = useRole();
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId") || undefined;
  const limit = 10;

  // Only fetch tasks if we are inside a specific folder/section
  const { data: tasksData, isLoading: isTasksLoading } = useGetTasks(
    folderId ? { page: currentPage, limit, folderId } : undefined
  );

  const { data: rootFoldersData, isLoading: isRootFoldersLoading } = useGetFolders(undefined);
  const { data: currentFolder, isLoading: isCurrentFolderLoading } = useGetFolderById(folderId as string);

  const foldersToDisplay = folderId ? (currentFolder?.children || []) : (rootFoldersData || []);
  const ancestors = currentFolder?.ancestors || [];
  const isFoldersLoading = folderId ? isCurrentFolderLoading : isRootFoldersLoading;
  const isLoading = folderId ? (isTasksLoading || isFoldersLoading) : isRootFoldersLoading;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const { mutateAsync: createFolder, isPending: isCreating } = useCreateFolderMutation();

  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const { mutateAsync: updateFolder, isPending: isUpdatingFolder } = useUpdateFolderMutation();
  const { mutateAsync: deleteFolder } = useDeleteFolderMutation();

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return;
    try {
      await createFolder({ name: newSectionName, parentId: folderId });
      setNewSectionName("");
      setIsCreateModalOpen(false);
      toast.success("Section created successfully");
    } catch (e) {
      toast.error("Failed to create section");
    }
  };

  // Activities only exist inside specific sections and only when data is not loading
  const filteredTasks = (folderId && !isTasksLoading) ? (tasksData?.data || []) : [];
  const totalTasks = (folderId && !isTasksLoading) ? (tasksData?.meta?.total || 0) : 0;
  const totalPages = Math.ceil(totalTasks / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isEmpty = foldersToDisplay.length === 0 && filteredTasks.length === 0;
  const canManageLibrary = role === "admin";

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      {folderId && (
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-500 mb-1 overflow-x-auto pb-1">
          <Link href="/content-library" className="hover:text-slate-900 transition-colors flex items-center gap-1.5 font-medium">
            <School className="w-3.5 h-3.5 text-slate-400" />
            Content Library
          </Link>
          {ancestors.map((anc) => (
            <div key={anc.id} className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href={`/content-library?folderId=${anc.id}`} className="hover:text-slate-900 font-medium transition-colors">
                {anc.name}
              </Link>
            </div>
          ))}
          {currentFolder && (
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">{currentFolder.name}</span>
            </div>
          )}
        </div>
      )}

      <SectionHeading
        heading={currentFolder ? currentFolder.name : "Content Library"}
        subheading={
          role === "admin"
            ? "View all tasks or filter by sections you've created."
            : "Choose published activities to add to your classes."
        }
        action={
          canManageLibrary && (!isEmpty || isLoading || isFoldersLoading) && (
            <div className="flex items-center gap-2.5">
              <Button 
                variant="outline" 
                className="gap-2 px-3.5 h-9 text-xs sm:text-[13px] font-medium rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-none" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
                Create Section
              </Button>

              {folderId && (
                <Link 
                  href={`/assign-task?folderId=${folderId}`}
                  className="inline-flex items-center gap-2 px-3.5 h-9 text-xs sm:text-[13px] font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer shadow-none"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </Link>
              )}
            </div>
          )
        }
      />

      {/* ── Content Area ── */}
      {(isLoading || isFoldersLoading) ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-xs sm:text-[13px] text-slate-500">
            Loading tasks...
          </p>
        </div>
      ) : (!folderId && foldersToDisplay.length === 0 && filteredTasks.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200/70 mb-3">
            <Folder className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Content Library
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 max-w-sm mb-5 font-normal">
            {canManageLibrary ? "Create a new section to organize your activities." : "Published activities will appear here when they are available."}
          </p>
          {canManageLibrary && (
            <Button 
              className="gap-2 px-4 h-9 text-xs sm:text-[13px] font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-none cursor-pointer" 
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FolderPlus className="w-4 h-4" />
              Create New Section
            </Button>
          )}
        </div>
      ) : (folderId && foldersToDisplay.length === 0 && filteredTasks.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200/70 mb-3">
            <School className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            This section is empty
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 max-w-sm mb-5 font-normal">
            {canManageLibrary ? "Create a folder or add an activity to get started." : "No published activities are in this section yet."}
          </p>
          {canManageLibrary && (
            <div className="flex items-center gap-2.5">
              <Button 
                variant="outline" 
                className="gap-2 px-3.5 h-9 text-xs sm:text-[13px] font-medium rounded-lg border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-none cursor-pointer" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
                Create Section
              </Button>
              <Link 
                href={`/assign-task?folderId=${folderId}`}
                className="inline-flex items-center gap-2 px-4 h-9 text-xs sm:text-[13px] font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {foldersToDisplay.length > 0 && (
            <div className="space-y-3">
              {folderId && (
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-slate-400" /> Sub-Sections
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {foldersToDisplay.map((folder) => (
                  <div key={folder.id} className="relative group">
                    <Link 
                      href={`/content-library?folderId=${folder.id}`}
                      className="flex flex-col p-4 sm:p-5 bg-white border border-slate-200/70 rounded-xl hover:border-slate-300 transition-colors cursor-pointer h-full overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-4 relative z-10 pr-8">
                        <div className="h-9 w-9 rounded-lg bg-slate-100/80 text-slate-600 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="text-sm sm:text-[15px] font-semibold text-slate-900 group-hover:text-primary transition-colors truncate flex-1" title={folder.name}>
                          {folder.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-auto relative z-10">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50/80 border border-slate-200/60 px-2 py-0.5 rounded-md">
                          <Folder className="w-3 h-3 text-slate-400" /> {folder._count?.children || 0} Sections
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50/80 border border-slate-200/60 px-2 py-0.5 rounded-md">
                          <School className="w-3 h-3 text-slate-400" /> {folder._count?.tasks || 0} Activities
                        </span>
                      </div>
                    </Link>

                    {canManageLibrary && (
                      <div className="absolute top-3.5 right-3.5 z-20">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" />}>
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 rounded-lg border border-slate-200/80 bg-white p-1 shadow-none">
                            <DropdownMenuItem 
                              className="text-xs sm:text-[13px] font-medium text-slate-700 cursor-pointer rounded-md focus:bg-slate-50"
                              onClick={() => {
                                setFolderToRename({ id: folder.id, name: folder.name });
                                setNewFolderName(folder.name);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5 mr-2 text-slate-500" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-xs sm:text-[13px] font-medium text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-md" 
                              onClick={async () => {
                                if ((folder._count?.children || 0) > 0 || (folder._count?.tasks || 0) > 0) {
                                  toast.error("Please delete the sections or activities inside it first.");
                                } else {
                                  if (window.confirm("Are you sure you want to delete this empty section?")) {
                                    try {
                                      await deleteFolder(folder.id);
                                      toast.success("Section deleted successfully.");
                                    } catch (e) {
                                      toast.error("Failed to delete section.");
                                    }
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2 text-red-500" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-400" /> Activities & Exam Papers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3 rounded-lg border border-slate-200/80 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 shadow-none cursor-pointer"
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    const isActive = currentPage === pageNum;
                    return (
                      <Button
                        key={pageNum}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-xs font-medium shadow-none cursor-pointer",
                          isActive 
                            ? "bg-primary text-white hover:bg-primary/90 border border-primary" 
                            : "border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-xs text-slate-400 self-center">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3 rounded-lg border border-slate-200/80 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-40 shadow-none cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Section Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border border-slate-200/70 bg-white p-5 sm:p-6 shadow-none">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Create New Section</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-3">
            <Input
              placeholder="Section Name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSection()}
              autoFocus
              className="h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-slate-200/80 bg-white text-slate-700 text-xs sm:text-[13px] font-medium hover:bg-slate-50 shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSection} 
              disabled={isCreating || !newSectionName.trim()}
              className="h-9 px-4 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-none cursor-pointer disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Section"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Section Dialog */}
      <Dialog open={!!folderToRename} onOpenChange={(open) => !open && setFolderToRename(null)}>
        <DialogContent className="sm:max-w-md rounded-xl border border-slate-200/70 bg-white p-5 sm:p-6 shadow-none">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">Rename Section</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-3">
            <Input
              placeholder="Section Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && newFolderName.trim() && folderToRename) {
                  try {
                    await updateFolder({ id: folderToRename.id, name: newFolderName });
                    toast.success("Renamed successfully.");
                    setFolderToRename(null);
                  } catch (e) {
                    toast.error("Failed to rename.");
                  }
                }
              }}
              autoFocus
              className="h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => setFolderToRename(null)}
              className="h-9 px-3.5 rounded-lg border border-slate-200/80 bg-white text-slate-700 text-xs sm:text-[13px] font-medium hover:bg-slate-50 shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              disabled={isUpdatingFolder || !newFolderName.trim()} 
              onClick={async () => {
                if (folderToRename) {
                  try {
                    await updateFolder({ id: folderToRename.id, name: newFolderName });
                    toast.success("Renamed successfully.");
                    setFolderToRename(null);
                  } catch (e) {
                    toast.error("Failed to rename.");
                  }
                }
              }}
              className="h-9 px-4 rounded-lg bg-primary text-white text-xs sm:text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-none cursor-pointer disabled:opacity-50"
            >
              {isUpdatingFolder ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
