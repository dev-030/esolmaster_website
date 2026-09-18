import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    attachPremiumTasks,
    cancelSubscription,
    changeUserPlan,
    confirmCheckoutSession,
    createCheckoutSession,
    createBillingPortalSession,
    createPlan,
    detachPremiumTask,
    getAdminBillingOverview,
    getAdminPlans,
    getAdminSubscriptions,
    getBillingInfo,
    getMySubscription,
    getPlanPremiumTasks,
    getSubscriptionPlans,
    updatePlan,
} from "./api";
import {
    AdminSubscription,
    ChangePlanBody,
    CheckOutBody,
    CreatePlanBody,
    SubscriptionParams,
    UpdatePlanBody,
} from "@/types/payment";
import { PaginatedResponse } from "@/types/pagintaion";

export const useGetSubscriptionPlans = () => {
    return useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: async () => getSubscriptionPlans(),
    })
}

export const useCreateCheckoutSessionMutation = () => {
    return useMutation({
        mutationKey: ['createCheckoutSession'],
        mutationFn: async (checkoutBody: CheckOutBody) => createCheckoutSession(checkoutBody),
    })
}

export const useConfirmCheckoutSessionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['confirmCheckoutSession'],
        mutationFn: async (sessionId: string) => confirmCheckoutSession(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
            queryClient.invalidateQueries({ queryKey: ['billingInfo'] });
            queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
        },
    });
};

export const useCreateBillingPortalSessionMutation = () => {
    return useMutation({
        mutationKey: ['createBillingPortalSession'],
        mutationFn: createBillingPortalSession,
    })
}

export const useGetMySubscription = () => {
    return useQuery({
        queryKey: ['mySubscription'],
        queryFn: async () => getMySubscription(),
    })
}

export const useGetBillingInfoQuery = () => {
    return useQuery({
        queryKey: ['billingInfo'],
        queryFn: async () => getBillingInfo(),
    })
}

export const useGetAdminBillingOverview = () => {
    return useQuery({
        queryKey: ['adminBillingOverview'],
        queryFn: async () => getAdminBillingOverview(),
        })
}

export const useGetAdminSubscriptions = (params: SubscriptionParams) => {
    return useQuery({
        queryKey: ['adminSubscriptions', params],
        queryFn: async (): Promise<PaginatedResponse<AdminSubscription>> => getAdminSubscriptions(params),
    })
}

export const useChangeUserPlanMutation = () => {
    return useMutation({
        mutationKey: ['changeUserPlan'],
        mutationFn: async ({ userId, changePlanBody }: { userId: string, changePlanBody: ChangePlanBody }) => changeUserPlan(userId, changePlanBody),
    })
}

export const useCancelSubscriptionMutation = () => {
    return useMutation({
        mutationKey: ['cancelSubscription'],
        mutationFn: async (userId: string) => cancelSubscription(userId),
    })
}

/* ── Admin: package (plan) management ───────────────────────── */

export const useGetAdminPlans = () => {
    return useQuery({
        queryKey: ['adminPlans'],
        queryFn: async () => getAdminPlans(),
    })
}

export const useCreatePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['createPlan'],
        mutationFn: async (body: CreatePlanBody) => createPlan(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
            queryClient.invalidateQueries({ queryKey: ['adminBillingOverview'] });
        },
    })
}

export const useUpdatePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['updatePlan'],
        mutationFn: async ({ planId, body }: { planId: string; body: UpdatePlanBody }) =>
            updatePlan(planId, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
            queryClient.invalidateQueries({ queryKey: ['adminBillingOverview'] });
        },
    })
}

export const useGetPlanPremiumTasksQuery = (planId: string) => {
    return useQuery({
        queryKey: ['planPremiumTasks', planId],
        queryFn: async () => getPlanPremiumTasks(planId),
        enabled: !!planId,
    })
}

export const useAttachPremiumTasksMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['attachPremiumTasks'],
        mutationFn: async ({ planId, taskIds }: { planId: string; taskIds: string[] }) =>
            attachPremiumTasks(planId, taskIds),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['planPremiumTasks', variables.planId] });
            queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
        },
    })
}

export const useDetachPremiumTaskMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ['detachPremiumTask'],
        mutationFn: async ({ planId, taskId }: { planId: string; taskId: string }) =>
            detachPremiumTask(planId, taskId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['planPremiumTasks', variables.planId] });
            queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
        },
    })
}
