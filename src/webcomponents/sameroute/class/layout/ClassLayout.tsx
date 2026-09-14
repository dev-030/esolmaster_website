"use client";

import { ReactNode, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useRole } from "@/provider/RoleProvider";
import { Button } from "@/components/ui/button";
import { ClassHeader } from "./ClassHeader";
import { useGetClassByIdQuery, useLeaveClassMutation } from "@/api/class";
import { ClassDetails } from "@/types/class";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  children: ReactNode;
}

export default function ClassLayout({ children }: Props) {
  const { role } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const classId = params.classId as string;

  const { data: cls } = useGetClassByIdQuery(classId);
  const { mutateAsync: leaveClass, isPending: isLeaving } = useLeaveClassMutation();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const isTeacher = role === "teacher";

  const segments = pathname.split("/").filter(Boolean);

  // tab = students | tasks | settings
  const currentTab = segments[2];

  // detect nested pages like /tasks/taskId
  const isNestedPage = segments.length > 3;

  const handleLeave = async () => {
    try {
      await leaveClass(classId);
      setLeaveDialogOpen(false);
      toast.success("You left the classroom");
      router.replace("/classes");
    } catch {
      toast.error("Unable to leave the classroom");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Class Header with Integrated Tabs */}
      {!isNestedPage && (
        <ClassHeader
          classDetails={cls as ClassDetails}
          isTeacher={isTeacher}
          currentTab={currentTab}
          onTabChange={(tabValue) => router.push(`/classes/${classId}/${tabValue}`)}
          action={
            role === "student" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLeaveDialogOpen(true)}
                disabled={isLeaving}
                className="gap-1.5 text-destructive hover:bg-destructive/5 hover:text-destructive rounded-[10px]"
              >
                <LogOut className="h-3.5 w-3.5" />
                {isLeaving ? "Leaving..." : "Leave class"}
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Route Content */}
      <div>{children}</div>

      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {cls?.name || "this classroom"}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to its activities. Your completed work stays in your learning history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleLeave} disabled={isLeaving}>
              {isLeaving ? "Leaving..." : "Leave classroom"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
