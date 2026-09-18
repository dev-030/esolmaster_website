import { PaginationQuery } from "./pagintaion";

export type ChangeDirection = "increase" | "decrease";

export interface StatItem {
  value: number;
  previousValue: number;
  changePercentage: number;
  direction: ChangeDirection;
}

export type ActivityType = "TASK_COMPLETED" | "LEVEL_UP" | "BADGE_EARNED"; // extend if more types exist

export interface RecentActivity {
  id: string;
  name: string;
  xpEarned: number;
  message: string;
  type: ActivityType;
}

export interface DashboardOverview {
  totalUsers: StatItem;
  totalScheduledTasks: StatItem;
  completedScheduledTasks: StatItem;
  newSignups: StatItem;

  recentActivities: RecentActivity[];
}

export interface AdminUser extends PaginationQuery{
  role?: string;
  search?: string;
}

export type UserRole = "teacher" | "student" | "admin"; // extend as needed
export type UserStatus = "Active" | "Inactive"; // extend if needed

export interface TeacherRelatedInfo {
  subject: string;
  institution: string;
  bio: string;
  classes: number;
  tasksCreated: number;
}

export interface User {
  id: string;
  name: string;

  firstName: string;
  lastName: string;
  email: string;

  role: UserRole;
  subscription?: {
    planName: string;
    planType: string;
    billingCycle?: string;
    billingStatus?: string;
  } | null;
  status: UserStatus;
  isActive: boolean;

  joinedAt: string;   // ISO date string
  lastActive: string; // ISO date string

  avatarUrl: string | null;

  relatedInfo: TeacherRelatedInfo;
}

 export interface UserSummary {
        totalUsers: number;
        totalStudents: number;
        totalTeachers: number;
        activeUsers: number;
        inactiveUsers: number;
    }