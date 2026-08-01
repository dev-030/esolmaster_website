const fs = require('fs');

const code = `"use client";

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

  const { data: tasksData, isLoading, isFetching } = useGetTasks({
    page: currentPage,
    limit,
    folderId,
  });

  const { data: rootFoldersData, isLoading: isRootFoldersLoading } = useGetFolders(undefined);
  const { data: currentFolder, isLoading: isCurrentFolderLoading } = useGetFolderById(folderId as string);

  const foldersToDisplay = folderId ? (currentFolder?.children || []) : (rootFoldersData || []);
  const ancestors = currentFolder?.ancestors || [];
  const isFoldersLoading = folderId ? isCurrentFolderLoading : isRootFoldersLoading;

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

  const filteredTasks = tasksData?.data || [];
  const totalTasks = tasksData?.meta?.total || 0;
  const totalPages = Math.ceil(totalTasks / limit);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isEmpty = foldersToDisplay.length === 0 && filteredTasks.length === 0;

  return (
    <div className="pt-0 pb-16 flex flex-col gap-6">
      {/* Breadcrumbs */}
      {folderId && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 overflow-x-auto pb-2">
          <Link href="/content-library" className="hover:text-foreground transition-colors flex items-center gap-1">
            <School className="w-4 h-4" />
            Content Library
          </Link>
          {ancestors.map((anc) => (
            <div key={anc.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              <Link href={\`/content-library?folderId=\${anc.id}\`} className="hover:text-foreground transition-colors">
                {anc.name}
              </Link>
            </div>
          ))}
          {currentFolder && (
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              <span className="font-semibold text-foreground">{currentFolder.name}</span>
            </div>
          )}
        </div>
      )}

      <SectionHeading
        heading={currentFolder ? currentFolder.name : "Content Library"}
        subheading={
          role === "admin"
            ? "View all tasks or filter by sections you've created."
            : "Here's a list of tasks assigned to you for your classes."
        }
        action={
          (!isEmpty || isLoading || isFoldersLoading) && (
            <div className="flex items-center gap-3">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 px-3 h-9 text-sm font-semibold rounded-full hover:bg-slate-50 transition-all border-slate-300 shadow-sm">
                    <FolderPlus className="w-4 h-4" />
                    Create Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Section</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Input
                      placeholder="Section Name"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSection()}
                      autoFocus
                    />
                    <Button onClick={handleCreateSection} disabled={isCreating || !newSectionName.trim()}>
                      {isCreating ? "Creating..." : "Create Section"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {folderId && (
                <Link 
                  href={\`/assign-task?folderId=\${folderId}\`}
                  className={buttonVariants({ variant: "default", size: "lg", className: "gap-2 px-6 py-6 text-base font-semibold rounded-full shadow-sm hover:shadow-md transition-all" })}
                >
                  <Plus className="w-6 h-6" />
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
          <p className="mt-4 text-sm text-muted-foreground">
            Loading tasks...
          </p>
        </div>
      ) : (!folderId && foldersToDisplay.length === 0 && filteredTasks.length === 0) ? (
        <div className={cn("flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 transition-opacity", isFetching && "opacity-50 pointer-events-none")}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-border mb-4">
            <Folder className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Content Library
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            Create a new section to organize your activities.
          </p>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <FolderPlus className="w-5 h-5" />
                Create New Section
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (folderId && foldersToDisplay.length === 0 && filteredTasks.length === 0) ? (
        <div className={cn("flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl bg-slate-50/50 transition-opacity", isFetching && "opacity-50 pointer-events-none")}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-border mb-4">
            <School className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            This section is empty
          </h3>
          <p className="text-muted-foreground mt-2 max-w-sm mb-6">
            Create a folder or add an activity to get started.
          </p>
          <div className="flex items-center gap-3">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2">
                  <FolderPlus className="w-5 h-5" />
                  Create Section
                </Button>
              </DialogTrigger>
            </Dialog>
            <Link 
              href={\`/assign-task?folderId=\${folderId}\`}
              className={buttonVariants({ size: "lg", className: "gap-2" })}
            >
              <Plus className="w-5 h-5" />
              Add Activity
            </Link>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-8 transition-opacity duration-200", isFetching && "opacity-50 pointer-events-none")}>
          {foldersToDisplay.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {foldersToDisplay.map((folder) => (
                <div key={folder.id} className="relative group">
                  <Link 
                    href={\`/content-library?folderId=\${folder.id}\`}
                    className="flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-200 transition-all duration-300 cursor-pointer h-full overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-3 mb-5 relative z-10 pr-8">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Folder className="w-6 h-6 fill-blue-100/50 group-hover:fill-blue-500/50 transition-colors" />
                      </div>
                      <span className="text-lg font-bold text-slate-800 truncate flex-1 tracking-tight" title={folder.name}>
                        {folder.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-auto relative z-10">
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <Folder className="w-3.5 h-3.5 text-slate-400" /> {folder._count?.children || 0} Sections
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                        <School className="w-3.5 h-3.5 text-slate-400" /> {folder._count?.tasks || 0} Activities
                      </span>
                    </div>
                  </Link>

                  <div className="absolute top-4 right-4 z-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => {
                          setFolderToRename({ id: folder.id, name: folder.name });
                          setNewFolderName(folder.name);
                        }}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={async () => {
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
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredTasks.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-2 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!folderToRename} onOpenChange={(open) => !open && setFolderToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Section</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderToRename(null)}>Cancel</Button>
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
            >
              {isUpdatingFolder ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
`
fs.writeFileSync('src/webcomponents/teacher/my-task/MyTask.tsx', code);
