/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Search, X, Loader2, Plus, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { useAddStudentsToClassMutation, useStudentFinderQuery } from "@/api/class";
import { useParams } from "next/navigation";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Student {
  username: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
  };
}

export const InviteStudentDialog = ({ open, onOpenChange }: Props) => {
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const { classId } = useParams() as { classId: string };
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { data: foundStudent, isFetching } = useStudentFinderQuery(debouncedEmail);

  const { mutateAsync: addStudentsToClass, isPending: isAdding } =
    useAddStudentsToClassMutation(classId);

  // Debounce search email
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchEmail.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedEmail(searchEmail);
      }, 500);
    } else {
      setDebouncedEmail("");
      setSearchResult(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchEmail]);

  // Handle search results - only display, don't auto-add
  useEffect(() => {
    if (debouncedEmail && foundStudent && !isFetching) {
      const student = foundStudent as Student;

      // Check if student is already selected
      const isAlreadySelected = selectedStudents.some(
        (s) => s.user.id === student.user.id
      );

      if (isAlreadySelected) {
        toast.warning(
          `${student.user.firstName} ${student.user.lastName} is already in the list`
        );
        setSearchResult(null);
      } else {
        setSearchResult(student);
      }
    } else if (debouncedEmail && !foundStudent && !isFetching) {
      setSearchResult(null);
      toast.error("No student found with this email");
    }
  }, [foundStudent, isFetching, debouncedEmail, selectedStudents]);

  const handleAddToSelection = () => {
    if (searchResult) {
      setSelectedStudents([...selectedStudents, searchResult]);
      toast.success(
        `Added: ${searchResult.user.firstName} ${searchResult.user.lastName}`
      );
      setSearchResult(null);
      setSearchEmail("");
      setDebouncedEmail("");
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((s) => s.user.id !== studentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
      toast.error("Please add at least one student");
      return;
    }

    try {
      const studentIds = selectedStudents.map((s) => s.user.id);
      await addStudentsToClass(studentIds);

      toast.success(
        `Successfully added ${selectedStudents.length} student${
          selectedStudents.length > 1 ? "s" : ""
        } to the class`
      );

      onOpenChange(false);
    } catch {
      toast.error("Failed to add students to class");
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchEmail("");
      setDebouncedEmail("");
      setSelectedStudents([]);
      setSearchResult(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[22px] border border-slate-200 bg-white p-6 shadow-xl">
        <DialogHeader className="gap-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-[#3454FB]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-800 tracking-tight">
                Add Students to Class
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 font-medium mt-0.5">
                Search registered students by email to enroll them in this class.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Search Section */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Search Student by Email
            </Label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="email"
                placeholder="student@email.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                disabled={isAdding}
                className="w-full pl-10 pr-10 h-10 rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-[#3454FB]/20 focus-visible:border-[#3454FB]"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {isFetching && (
                  <Loader2 className="h-4 w-4 animate-spin text-[#3454FB]" />
                )}
                {!isFetching && searchEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchEmail("");
                      setDebouncedEmail("");
                      setSearchResult(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Start typing an email address to search for registered students
            </p>
          </div>

          {/* Search Result - Add to Selection */}
          {searchResult && !isFetching && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Found Student
              </Label>
              <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3454FB] text-xs font-bold text-white shadow-xs">
                    {searchResult.user.firstName?.charAt(0)?.toUpperCase()}
                    {searchResult.user.lastName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {searchResult.user.firstName} {searchResult.user.lastName}
                    </p>
                    <p className="truncate text-[11px] font-medium text-slate-500">
                      {searchResult.user.email}
                      {searchResult.username ? ` · @${searchResult.username}` : ""}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddToSelection}
                  className="ml-2 gap-1 rounded-[10px] bg-[#3454FB] hover:bg-[#2842D8] text-white text-xs font-semibold h-8 px-3 shadow-none shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Selected Students List */}
          {selectedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Ready to Enroll ({selectedStudents.length})
                </Label>
                <button
                  type="button"
                  onClick={() => setSelectedStudents([])}
                  className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden max-h-48 overflow-y-auto">
                {selectedStudents.map((student) => (
                  <div
                    key={student.user.id}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#3454FB]">
                        {student.user.firstName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                        <p className="truncate text-[11px] font-medium text-slate-400">
                          {student.user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStudent(student.user.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove student"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedStudents.length === 0 && !searchResult && (
            <div className="flex flex-col items-center justify-center py-8 px-4 rounded-[18px] border border-dashed border-slate-200 bg-slate-50/40 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 mb-2.5 shadow-2xs">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                No students selected yet
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 max-w-[240px]">
                Search an email address above and click Add to stage students for this classroom
              </p>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
              className="rounded-xl text-xs font-semibold h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedStudents.length === 0 || isAdding}
              className="rounded-xl bg-[#3454FB] hover:bg-[#2842D8] text-white font-semibold text-xs h-9 px-4 shadow-none disabled:opacity-40"
            >
              {isAdding ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              )}
              Add {selectedStudents.length > 0 && `(${selectedStudents.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};