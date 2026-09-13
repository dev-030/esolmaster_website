import { axios } from "@/lib/axios"
import {
   ChangePlanBody,
   CheckOutBody,
   CreatePlanBody,
   SubscriptionParams,
   UpdatePlanBody,
} from "@/types/payment";


const commonroute= '/payment/admin/billing/';

export const getSubscriptionPlans = async () => {
   const { data } = await axios.get('/payment/plans')
   return data
};

export const createCheckoutSession = async (checkoutBody: CheckOutBody) => {
   const { data } = await axios.post('/payment/checkout', checkoutBody);
   return data;
};

export const getMySubscription = async () => {
   const { data } = await axios.get('/payment/me');
   return data;
}

export const getBillingInfo = async () => {
   const { data } = await axios.get('/payment/billing-info');
   return data;
}

export const createBillingPortalSession = async () => {
   const { data } = await axios.post('/payment/portal');
   return data;
}

export  const getAdminBillingOverview = async () => {
   const { data } = await axios.get(commonroute + 'overview');
   return data;
}

export const getAdminSubscriptions = async (params: SubscriptionParams) => {
   const { data } = await axios.get(commonroute + 'subscribers', { params });
   return data;
}

export const changeUserPlan = async (userId:string,changePlanBody: ChangePlanBody) => {
   const { data } = await axios.patch(`${commonroute}users/${userId}/change-plan`, changePlanBody);
   return data;
}

export const cancelSubscription = async (userId: string) => {
   const { data } = await axios.patch(`${commonroute}users/${userId}/cancel`);
   return data;
}

/* ── Admin: package (plan) management ───────────────────────── */

const plansRoute = '/payment/admin/plans';

export const getAdminPlans = async () => {
   const { data } = await axios.get(plansRoute);
   return data;
}

export const createPlan = async (body: CreatePlanBody) => {
   const { data } = await axios.post(plansRoute, body);
   return data;
}

export const updatePlan = async (planId: string, body: UpdatePlanBody) => {
   const { data } = await axios.patch(`${plansRoute}/${planId}`, body);
   return data;
}

export const getPlanPremiumTasks = async (planId: string) => {
   const { data } = await axios.get(`${plansRoute}/${planId}/premium-tasks`);
   return data;
}

export const attachPremiumTasks = async (planId: string, taskIds: string[]) => {
   const { data } = await axios.post(`${plansRoute}/${planId}/premium-tasks`, { taskIds });
   return data;
}

export const detachPremiumTask = async (planId: string, taskId: string) => {
   const { data } = await axios.patch(`${plansRoute}/${planId}/premium-tasks/${taskId}/detach`);
   return data;
}
