import { useQuery } from "@tanstack/react-query";
import {
  getStudentActivity,
  getStudentBadges,
  getStudentDashboard,
  getStudentProgress,
  getStudentScheduledTasks,
  getStudentScoreTrend,
  getStudentSkillDistribution,
} from "./api";
import { ScheduledTaskQuery } from "@/types/student";

export const useGetStudentDashboardQuery = () => {
  return useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: getStudentDashboard,
  });
};

export const useGetStudentProgressQuery = () => {
  return useQuery({
    queryKey: ["student", "progress"],
    queryFn: getStudentProgress,
  });
};

export const useGetStudentActivityQuery = () => {
  return useQuery({
    queryKey: ["student", "activity"],
    queryFn: getStudentActivity,
  });
};

export const useGetStudentScoreTrendQuery = () => {
  return useQuery({
    queryKey: ["student", "score-trend"],
    queryFn: getStudentScoreTrend,
  });
};

export const useGetStudentBadgesQuery = () => {
  return useQuery({
    queryKey: ["student", "badges"],
    queryFn: getStudentBadges,
  });
};

export const useGetStudentSkillDistributionQuery = () => {
  return useQuery({
    queryKey: ["student", "skill-distribution"],
    queryFn: getStudentSkillDistribution,
  });
}

export const useGetStudentScheduledTasksQuery = (params: ScheduledTaskQuery) => {
  return useQuery({
    queryKey: ["student", "scheduled-tasks", params],
    queryFn: () => getStudentScheduledTasks(params),
  });
};
