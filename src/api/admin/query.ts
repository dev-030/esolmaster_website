import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { adminPerformance, exportAdminPerformanceData, exportAdminReport, getAdminDashboard, getAdminPlatformAnalytics, getAdminUserInfo, getAdminUsers } from "./api";
import { AdminUser } from "@/types/admin";

export const useGetAdminDashboardQuery = () => {

    return useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () =>getAdminDashboard(),
        placeholderData: keepPreviousData
    });
}

export const useGetAdminUsersQuery = (params: AdminUser) => {
    return useQuery({
        queryKey: ['adminUsers', params],
        queryFn: async () => getAdminUsers(params),
        placeholderData: (previousData, previousQuery) => {
            // Only keep previous data when navigating pages within the exact same role and search filter
            const prevParams = previousQuery?.queryKey?.[1] as AdminUser | undefined;
            if (
                prevParams &&
                prevParams.role === params.role &&
                prevParams.search === params.search
            ) {
                return previousData;
            }
            return undefined;
        },
        staleTime: 1000 * 60 * 3, // 3 minutes cache for instant tab switching
    });
}

export const useGetAdminUserInfoQuery = (userId:string) => {

    return useQuery({
        queryKey: ['adminUserInfo',userId],
        queryFn: async () =>getAdminUserInfo(userId)
    });
}

export const useGetAdminPerformanceQuery = () => {
    return useQuery({
        queryKey: ['adminPerformance'],
        queryFn: async () => adminPerformance()
    });
}

export const useExportAdminPerformanceMutation = () => {
  return useMutation({
    mutationFn: exportAdminPerformanceData,
  });
};

export const useGetAdminPlatformAnalyticsQuery = () => {
    return useQuery({
        queryKey: ['adminPlatformAnalytics'],
        queryFn: async () => getAdminPlatformAnalytics()
    });
}

export const useExportAdminReportMutation = () => {
    return useMutation({
        mutationFn: (type: string) => exportAdminReport(type),
    });
}