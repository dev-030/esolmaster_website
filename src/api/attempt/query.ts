

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAttempt, startAttempt, submitAnswer } from "./api";

export const useStartAttemptMutation = () => {
  return useMutation({
    mutationFn: startAttempt,
  });
};

export const useGetAttemptQuery = (attemptId?: string) => {
  return useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: () => getAttempt(attemptId!),
    enabled: !!attemptId,
  });
};

export const useSubmitAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAnswer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attempt", variables.attemptId],
      });
      queryClient.invalidateQueries({ queryKey: ["classScheduledTasks"] });
    },
  });
};
