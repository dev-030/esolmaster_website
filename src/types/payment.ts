import { PaginationQuery } from "./pagintaion";

export interface CheckOutBody {
  planId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
}

export interface AdminBillingPlan {
  id: string;
  name: string;
  type: 'FREE' | 'BASIC' | 'PRO' | string;
  monthlyPrice: number;
  annualPrice: number;
  stripeMonthlyPriceId: string | null;
  stripeAnnualPriceId: string | null;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxScheduledTasksInClass: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBillingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isOnboarded: boolean;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  planId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL' | null;
  billingStatus: string;
  boughtPrice: number;
  discountAmount: number;
  finalPrice: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  changedByAdminId: string | null;
  changedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminBillingUser;
  plan: AdminBillingPlan;
}

export interface SubscriptionParams extends PaginationQuery {
  planType?: 'FREE' | 'BASIC' | 'PRO';
  billingCycle?: 'MONTHLY' | 'ANNUAL';
  search?: string;
}

export interface ChangePlanBody {
  planType: 'PRO' | 'BASIC' | 'FREE';
  billingCycle: 'MONTHLY' | 'ANNUAL';
}

export interface PremiumTaskRef {
  id: string;
  title: string;
  type: string;
  isPremium: boolean;
  status?: string;
}

export interface PlanPremiumTaskLink {
  id: string;
  planId: string;
  taskId: string;
  createdAt: string;
  task: PremiumTaskRef;
}

export interface AdminPlan extends AdminBillingPlan {
  stripeProductId: string | null;
  premiumTasks: PlanPremiumTaskLink[];
  _count: { subscriptions: number };
}

export interface CreatePlanBody {
  name: string;
  type: 'FREE' | 'BASIC' | 'PRO';
  description?: string;
  monthlyPrice: number; // cents
  annualPrice: number; // cents
  currency?: string;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxScheduledTasksInClass: number;
}

export type UpdatePlanBody = Partial<CreatePlanBody> & { isActive?: boolean };

export interface TeacherSubscription {
  id: string;
  userId: string;
  planId: string;
  billingCycle: 'MONTHLY' | 'ANNUAL' | null;
  billingStatus: 'ACTIVE' | 'PAST_DUE' | 'TRIALING' | 'CANCELED' | 'CANCELING' | 'PAYMENT_ACTION_REQUIRED';
  boughtPrice: number;
  discountAmount: number;
  finalPrice: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  plan?: AdminBillingPlan | null;
  usage?: {
    classesCount: number;
  };
  allowedPremiumTaskIds?: string[];
}
