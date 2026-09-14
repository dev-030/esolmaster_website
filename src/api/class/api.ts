import { axios } from "@/lib/axios";
import { Class, ClassDetails, ClassTaskWithClass, CreateClassPayload, ScheduledTaskAnalytics, ScheduleTaskDto, StudentData, StudentQuery } from "@/types/class";
import { PaginatedResponse } from "@/types/pagintaion";

export const createClass = async (payload: CreateClassPayload) => {
  const { data } = await axios.post("/classes", payload);
  return data;
};

export const getClasses = async (params: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Class>> => {
  const { data } = await axios.get("/classes", { params });
  return data;
};

export const getClassById = async (id: string): Promise<ClassDetails> => {
  const { data } = await axios.get(`/classes/${id}`);
  return data;
};

export const joinClassByCode = async (code: string) => {
  const { data } = await axios.post("/classes/join", { code });
  return data;
};

export const regenerateClassJoinCode = async (id: string) => {
  const { data } = await axios.post(`/classes/${id}/join-code/regenerate`);
  return data;
};

export const updateClassJoinStatus = async (
  id: string,
  status: "OPEN" | "PAUSED" | "CLOSED",
) => {
  const { data } = await axios.patch(`/classes/${id}/join-status`, { status });
  return data;
};

export const updateClass = async (
  id: string,
  payload: Partial<CreateClassPayload>,
) => {
  const { data } = await axios.patch(`/classes/${id}`, payload);
  return data;
};

export const deleteClass = async (id: string) => {
  const { data } = await axios.delete(`/classes/${id}`);
  return data;
};

export const addStudentsToClass = async (id: string, studentIds: string[]) => {
  const { data } = await axios.post(`/classes/${id}/students`, { studentIds });
  return data;
};

export const removeStudentsFromClass = async (
  id: string,
  studentIds: string[],
) => {
  const { data } = await axios.delete(`/classes/${id}/students`, {
    data: { studentIds },
  });
  return data;
};

export const leaveClass = async (id: string) => {
  const { data } = await axios.delete(`/classes/${id}/membership`);
  return data;
};

export const scheduleTaskForClass = async (
  id: string,
  taskId: string,
  scheduledDate: string,
) => {
  const { data } = await axios.post(`/classes/${id}/schedule`, {
    taskId,
    scheduledDate,
  });
  return data;
};

export const studentFinder = async (search: string) => {
  const { data } = await axios.get(`/finder?search=${search}`);
  return data;
};

export const getStudentsInClass = async (id: string, params: StudentQuery):Promise<PaginatedResponse<StudentData>> => {
  const { data } = await axios.get(`/classes/${id}/students`, {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
    },
  });
  return data;
};

export const scheduleClassTask = async (id: string, payload: ScheduleTaskDto) => {
  const { data } = await axios.post(`/classes/${id}/schedule`, payload);
  return data;
};

export const addTasksToClass = async (id: string, taskIds: string[]) => {
  const { data } = await axios.post(`/classes/${id}/tasks`, { taskIds });
  return data;
};

export const getScheduledTasksForClass = async (id: string):Promise<ClassTaskWithClass[]> => {
  const { data } = await axios.get(`/classes/${id}/scheduled-tasks`);
  return data;
}

export const getScheduledTaskAnalytics = async (
  classId: string,
  scheduledTaskId: string,
): Promise<ScheduledTaskAnalytics> => {
  const { data } = await axios.get(
    `/classes/${classId}/scheduled-tasks/${scheduledTaskId}/analytics`,
  );

  return data;
};

export const getClassStudentProgress = async (classId: string) => {
  const { data } = await axios.get(`/classes/${classId}/students/progress`);
  return data;
}
