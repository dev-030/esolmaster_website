/* eslint-disable @typescript-eslint/no-explicit-any */
import { axios } from "@/lib/axios";
import { PaginatedResponse, PaginationQuery } from "@/types/pagintaion";
import {
  CreateGrammarTaskPayload,
  Criterion,
  ScheduledTaskOverview,
  Task,
  TaskQuery,
} from "@/types/task";

export const createTask = async (
  payload: CreateGrammarTaskPayload | FormData,
) => {
  const { data } = await axios.post("/tasks", payload);
  return data;
};

export const updateTask = async (taskId: string, payload: FormData | Record<string, unknown>) => {
  const { data } = await axios.patch(`/tasks/${taskId}`, payload);
  return data;
};

export const addQuestions = async (taskId: string, questions: any[]) => {
  const { data } = await axios.post(`/tasks/${taskId}/questions`, {
    questions,
  });
  return data;
};

export const getTaskWords = async (taskId: string, search?: string) => {
  const params = search ? { search } : {};
  const { data } = await axios.get(`/tasks/${taskId}/words`, { params });
  return data;
};

export const getTasks = async (params?: TaskQuery):Promise<PaginatedResponse<Task>> => {
  const { data } = await axios.get("/tasks", {
    params,
  });

  return data;
};
export const approveTask = async (taskId: string) => {
  const { data } = await axios.patch(`/tasks/${taskId}/approve`);
  return data;
};

export const rejectTask = async (taskId: string) => {
  const { data } = await axios.patch(`/tasks/${taskId}/reject`);
  return data;
}

export const getCriterion = async (
  params: PaginationQuery,
): Promise<PaginatedResponse<Criterion>> => {
  const { data } = await axios.get("/criteria",{
    params,
  });
  return data;
}

export const getTaskById = async (taskId: string) => {
  const { data } = await axios.get(`/tasks/${taskId}`);
  return data;
}

export const getAllScheduledTasks = async (params: PaginationQuery): Promise<PaginatedResponse<ScheduledTaskOverview>> => {
  const { data } = await axios.get("/tasks/scheduled", { params });
  return data;
}

export const deleteTask = async (taskId: string) => {
  const { data } = await axios.delete(`/tasks/${taskId}`);
  return data;
};
