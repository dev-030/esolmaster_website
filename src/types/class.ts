import { PaginationQuery } from "./pagintaion";
import { Task } from "./task";

export interface CreateClassPayload {
  name: string;
  subject: string;
  description?: string;
  color: string;
  maxStudents?: number | null;

  taskIds?: string[];
}

export interface ClassTaskTask {
  id: string;
  title: string;
  type: string;
  status: string;
}

export interface ScheduledTask {
  id: string;
  scheduledAt?: string;
  dueAt?: string;
  isActive?: boolean;
}

export interface ClassTask {
  classTaskId: string;
  addedAt: string;
  task: ClassTaskTask;
  scheduled: ScheduledTask | null;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  maxStudents?: number | null;

  teacherName: string;
  studentCount: number;
  taskCount: number;

  classTasks: ClassTask[];

  createdAt: string;
  joinStatus?: "OPEN" | "PAUSED" | "CLOSED";
  joinCode?: string;
}

export interface StudentQuery extends PaginationQuery {
  search?: string;
}

export interface ClassTaskForStudent {
  classTaskId: string;
  addedAt: string;
  task: Task;
  scheduled: ScheduledTask | null;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
}

export interface ClassDetails {
  id: string;
  name: string;
  subject: string;
  description: string;
  color: string;
  maxStudents?: number | null;

  teacherName: string;
  studentCount: number;
  taskCount: number;

  classTasks: ClassTask[];

  students: Student[];

  tasks: ClassTask[];

  createdAt: string;
  joinStatus?: "OPEN" | "PAUSED" | "CLOSED";
  joinCode?: string;
}

export interface ScheduleTaskDto {
  classTaskId: string;
  dueAt?: string;
  isActive?: boolean;
}

export interface ClassSummary {
  id: string;
  name: string;
}
export interface ClassTaskWithClass {
  classTaskId: string;
  addedAt: string;
  task: { questionCount: number } & Task;
  scheduled: ScheduledTask | null;
  class: ClassSummary;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  totalQuestions: number;
  answeredQuestions: number;
  progressPercentage: number;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  score?: number | null;
  totalMarks?: number;
  percentage?: number | null;
  isPassed?: boolean | null;
  completedAt?: string | null;
  canAttempt?: boolean;
  averagePercentage?: number;
}

export interface ScheduledTaskStudentResult {
  id: string;
  name: string;
  email: string;
  attemptId: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  score: number | null;
  percentage: number | null;
  isPassed: boolean | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ScheduledTaskAnalytics {
  task: { id: string; title: string; type: string };
  scheduledAt: string;
  dueAt: string | null;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  averagePercentage: number;
  totalMarks: number;
  students: ScheduledTaskStudentResult[];
}

export interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  username: string;
  joinedAt: string; // ISO date string
  progress: TaskProgress;
}

export interface TaskProgress {
  totalTasks: number;
  startedTasks: number;
  completedTasks: number;
  passedTasks: number;
  progressPercentage: number;
}
