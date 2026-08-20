/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateGrammarTaskPayload, TaskQuery } from "@/types/task";
import { PaginationQuery } from "@/types/pagintaion";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  addQuestions,
  approveTask,
  createTask,
  getAllScheduledTasks,
  getCriterion,
  getTaskById,
  getTasks,
  getTaskWords,
  rejectTask,
  updateTask,
  deleteTask,
} from "./api";

export const useCreateTaskMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateGrammarTaskPayload | FormData) => {
      return createTask(payload);
    },
  });
};

export const useUpdateTaskMutation = (taskId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: FormData;
    }) => {
      return updateTask(taskId as string, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useAddQuestionsMutation = (taskId: string) => {
  return useMutation({
    mutationFn: async (questions: any[]) => {
      return addQuestions(taskId, questions);
    },
  });
};

export const useGetTaskWords = (taskId: string, search?: string) => {
  return useQuery({
    queryKey: ["task-words", taskId, search],
    queryFn: () => getTaskWords(taskId, search),
  });
};

export const useGetTaskWordsForSearch = (taskId: string, search: string) =>
  useQuery({
    queryKey: ["task-words", taskId, search],
    queryFn: () => getTaskWords(taskId, search),
    enabled: !!taskId,
  });

export const useGetTasks = (params?: TaskQuery) => {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
  });
};

export const useApproveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return approveTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useRejectTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      return rejectTask(taskId);
    }
    ,onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};

export const useGetCriterionInfiniteQuery = (params?: Omit<PaginationQuery, "page">) => {
  const limit = params?.limit ?? 10;

  return useInfiniteQuery({
    queryKey: ["criteria", params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getCriterion({
        ...params,
        page: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};

export const useGetTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
  });
}

export const useGetAllScheduledTasksQuery = (pagination: PaginationQuery) => {
  return useQuery({
    queryKey: ["scheduled-tasks", pagination],
    queryFn: () => getAllScheduledTasks(pagination),
  });
}

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      return deleteTask(taskId);
    },
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasksQueries = queryClient.getQueriesData({ queryKey: ["tasks"] });

      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.filter((t: any) => t.id !== taskId);
        }
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((t: any) => t.id !== taskId),
            meta: old.meta ? { ...old.meta, total: Math.max(0, (old.meta.total || 1) - 1) } : old.meta,
          };
        }
        return old;
      });

      return { previousTasksQueries };
    },
    onError: (err, taskId, context: any) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]: any) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};