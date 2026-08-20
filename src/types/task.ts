import { PaginationQuery } from "./pagintaion";

/* eslint-disable @typescript-eslint/no-explicit-any */
export enum TaskType {
  READING = "READING",
  WRITING = "WRITING",
  LISTENING = "LISTENING",
  SPEAKING = "SPEAKING",
  GRAMMAR = "GRAMMAR",
  VOCABULARY = "VOCABULARY",
}

export enum AwardingBody {
  ESB = "ESB",
  ASCENTIS = "ASCENTIS",
  GATEWAY = "GATEWAY",
  TRINITY = "TRINITY",
}

export type EntryType =
  | "ENTRY1"
  | "ENTRY2"
  | "ENTRY3"
  | "LEVEL1"
  | "LEVEL2";

export interface CreateGrammarTaskPayload {
  title: string;
  type: TaskType;
  content: string;
  entryType: EntryType[];
  questions: {
    type: string;
    order: number;
    config: any;
  }[];
  isPublic?: boolean;
  isPremium?: boolean;
  organizationId?: string;
}

export interface CreateVocabularyTaskPayload {
  title: string;
  type: TaskType;
  words: {
    wordName: string;
    definition: string;
    imageFile?: File;
  }[];
  isPublic?: boolean;
  isPremium?: boolean;
  organizationId?: string;
}

export type TaskStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export interface TaskQuery extends PaginationQuery {
  status?: TaskStatus;
  isPremium?: boolean;
  type?: TaskType;
  search?: string;
  folderId?: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | string;
  isPublic: boolean;
  isPremium?: boolean;
  createdById: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string;

  readingContent?: {
    awardingBody?: AwardingBody;
    entryType?: EntryType[];
    passMark?: number;
    passLogic?: string;
    imageUrl?: string;
  };
  grammarContent?: {
    entryType?: EntryType[];
  };

  createdBy: {
    email: string;
    firstName?: string;
    lastName?: string;
  };

  classes?: { id: string; name: string }[];
}

export interface Criterion {
  id: string;
  code: string;
  description: string;
}

export interface ScheduledTaskOverview {
  scheduledTaskId: string;
  title: string;
  type: TaskType;

  className: string;

  totalQuestions: number;

  totalStudents: number;
  completedStudents: number;
  completionRate: number;

  scheduledAt: string;
  dueAt: string;

  answeredQuestions: number;
  progressPercentage: number;

}
