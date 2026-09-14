import {
  Class,
  CreateClassPayload,
  ScheduleTaskDto,
  StudentQuery,
} from "@/types/class";
import { PaginatedResponse } from "@/types/pagintaion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStudentsToClass,
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  getClassStudentProgress,
  getScheduledTaskAnalytics,
  getScheduledTasksForClass,
  getStudentsInClass,
  joinClassByCode,
  leaveClass,
  regenerateClassJoinCode,
  removeStudentsFromClass,
  scheduleClassTask,
  studentFinder,
  updateClassJoinStatus,
  updateClass,
} from "./api";

export const useCreateClassMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClassPayload) => {
      return createClass(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
};

export const useGetClassesQuery = ({ page = 1, limit = 10 }) => {
  return useQuery({
    queryKey: ["classes", { page, limit }],
    queryFn: async () => getClasses({ page, limit }),
  });
};

export const useGetClassByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["class", id],
    queryFn: async () => getClassById(id),
    enabled: !!id,
  });
};

export const useJoinClassMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinClassByCode,
    onSuccess: (result) => {
      const joinedClass = result.class as Class;
      queryClient.setQueriesData<PaginatedResponse<Class>>(
        { queryKey: ["classes"] },
        (current) => {
          if (!current || current.data.some((classroom) => classroom.id === joinedClass.id)) return current;
          const total = current.meta.total + 1;
          return {
            data: [joinedClass, ...current.data].slice(0, current.meta.limit),
            meta: { ...current.meta, total, totalPages: Math.ceil(total / current.meta.limit) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["classes"], refetchType: "none" });
    },
  });
};

export const useLeaveClassMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveClass,
    onSuccess: (_data, classId) => {
      queryClient.setQueriesData<PaginatedResponse<Class>>(
        { queryKey: ["classes"] },
        (current) => {
          if (!current) return current;
          const data = current.data.filter((classroom) => classroom.id !== classId);
          const total = Math.max(0, current.meta.total - (data.length === current.data.length ? 0 : 1));
          return {
            data,
            meta: { ...current.meta, total, totalPages: Math.ceil(total / current.meta.limit) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["classes"], refetchType: "none" });
      queryClient.removeQueries({ queryKey: ["class", classId] });
    },
  });
};

export const useRegenerateClassJoinCodeMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => regenerateClassJoinCode(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["class", id] }),
  });
};

export const useUpdateClassJoinStatusMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "OPEN" | "PAUSED" | "CLOSED") =>
      updateClassJoinStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["class", id] }),
  });
};

export const useUpdateClassMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateClassPayload>;
    }) => {
      return updateClass(id, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class", variables.id] });
    },
  });
};

export const useDeleteClassMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
    },
  });
};

export const useAddStudentsToClassMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentIds: string[]) =>
      addStudentsToClass(id, studentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
  });
};

export const useRemoveStudentsFromClassMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentIds: string[]) => {
      return removeStudentsFromClass(id, studentIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
  });
};

export const useStudentFinderQuery = (search: string) => {
  return useQuery({
    queryKey: ["studentFinder", search],
    queryFn: async () => studentFinder(search),
    enabled: !!search,
  });
};

export const useGetStudentsInClassQuery = (
  id: string,
  params: StudentQuery,
) => {
  return useQuery({
    queryKey: ["classStudents", id, params],
    queryFn: async () => getStudentsInClass(id, params),
    enabled: !!id,
  });
};

export const useScheduleClassTaskMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ScheduleTaskDto) =>
      scheduleClassTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id] });
    },
  });
};

export const useGetScheduledTasksForClassQuery = (id: string) => {
  return useQuery({
    queryKey: ["classScheduledTasks", id],
    queryFn: async () => getScheduledTasksForClass(id),
    enabled: !!id,
  });
};

export const useGetScheduledTaskAnalyticsQuery = (
  classId: string,
  scheduledTaskId: string,
) => {
  return useQuery({
    queryKey: ["scheduled-task-analytics", classId, scheduledTaskId],
    queryFn: () => getScheduledTaskAnalytics(classId, scheduledTaskId),
    enabled: !!classId && !!scheduledTaskId,
  });
};

export const useGetClassStudentProgressQuery = (classId: string) => {
  return useQuery({
    queryKey: ["class-student-progress", classId],
    queryFn: () => getClassStudentProgress(classId),
  });
}
