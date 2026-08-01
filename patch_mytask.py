import re

with open("src/webcomponents/teacher/my-task/MyTask.tsx", "r") as f:
    content = f.read()

# Add imports
imports = """
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useUpdateFolderMutation, useDeleteFolderMutation } from "@/api/folder";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
"""
content = content.replace('import { useGetFolders, useGetFolderById } from "@/api/folder";', 
                          'import { useGetFolders, useGetFolderById } from "@/api/folder";\n' + imports)

# Add state
state = """
  const [folderToRename, setFolderToRename] = useState<{ id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const { mutateAsync: updateFolder, isPending: isUpdatingFolder } = useUpdateFolderMutation();
  const { mutateAsync: deleteFolder } = useDeleteFolderMutation();
"""
content = content.replace('const [newSectionName, setNewSectionName] = useState("");', 
                          'const [newSectionName, setNewSectionName] = useState("");\n' + state)

# Add dropdown to card
card_target = """                      <span className="text-lg font-bold text-slate-800 truncate flex-1 tracking-tight" title={folder.name}>
                        {folder.name}
                      </span>"""
dropdown = """                      <span className="text-lg font-bold text-slate-800 truncate flex-1 tracking-tight" title={folder.name}>
                        {folder.name}
                      </span>
                      <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50">
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
                                if (confirm("Are you sure you want to delete this empty section?")) {
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
                      </div>"""
content = content.replace(card_target, dropdown)

# Add rename modal at the end before last closing brace
modal = """
      {/* Rename Dialog */}
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
"""
content = re.sub(r'    </div>\n  \);\n};\n?$', modal, content)

with open("src/webcomponents/teacher/my-task/MyTask.tsx", "w") as f:
    f.write(content)
