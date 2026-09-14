import { getServerAuth } from "@/lib/server";
import { TaskRunner, TeacherTaskResults } from "@/webcomponents/sameroute";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    classId: string;
    taskId: string;
  }>;
}

export default async function TaskRunnerPage({ params }: PageProps) {
  await params;

  const auth = await getServerAuth();
  if (!auth) redirect("/login");

  if (auth.role === "student") {
    return <TaskRunner />;
  }

  return <TeacherTaskResults />;
}
