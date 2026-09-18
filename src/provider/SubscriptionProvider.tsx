"use client";

import React, { createContext, useContext, useState } from "react";
import { useGetMySubscription } from "@/api/payment";
import { useRole } from "./RoleProvider";
import { TeacherSubscription } from "@/types/payment";
import { UpgradeModal } from "@/webcomponents/shared/UpgradeModal";

interface SubscriptionLimits {
  maxClasses: number;
  maxStudentsPerClass: number;
  maxScheduledTasksInClass: number;
}

interface SubscriptionContextType {
  subscription: TeacherSubscription | null;
  plan: TeacherSubscription["plan"] | null;
  planType: "FREE" | "BASIC" | "PRO";
  limits: SubscriptionLimits;
  usage: {
    classesCount: number;
  };
  allowedPremiumTaskIds: string[];
  isPro: boolean;
  isBasic: boolean;
  isFree: boolean;
  canCreateClass: boolean;
  isPremiumTaskAllowed: (taskId: string) => boolean;
  openUpgradeModal: (title?: string, description?: string) => void;
  closeUpgradeModal: () => void;
  isLoading: boolean;
}

const DEFAULT_LIMITS: SubscriptionLimits = {
  maxClasses: 2,
  maxStudentsPerClass: 20,
  maxScheduledTasksInClass: 5,
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  plan: null,
  planType: "FREE",
  limits: DEFAULT_LIMITS,
  usage: { classesCount: 0 },
  allowedPremiumTaskIds: [],
  isPro: false,
  isBasic: false,
  isFree: true,
  canCreateClass: true,
  isPremiumTaskAllowed: () => false,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  isLoading: false,
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { role } = useRole();
  const isTeacher = role === "teacher";

  const { data: subData, isLoading } = useGetMySubscription();
  const subscription = (isTeacher ? subData : null) as TeacherSubscription | null;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ title?: string; description?: string }>({});

  const plan = subscription?.plan || null;
  const rawType = (plan?.type || "FREE").toUpperCase();
  const planType: "FREE" | "BASIC" | "PRO" =
    rawType === "PRO" ? "PRO" : rawType === "BASIC" ? "BASIC" : "FREE";

  const limits: SubscriptionLimits = {
    maxClasses: plan?.maxClasses ?? DEFAULT_LIMITS.maxClasses,
    maxStudentsPerClass: plan?.maxStudentsPerClass ?? DEFAULT_LIMITS.maxStudentsPerClass,
    maxScheduledTasksInClass: plan?.maxScheduledTasksInClass ?? DEFAULT_LIMITS.maxScheduledTasksInClass,
  };

  const usage = {
    classesCount: subscription?.usage?.classesCount ?? 0,
  };

  const allowedPremiumTaskIds = subscription?.allowedPremiumTaskIds ?? [];

  const isPro = planType === "PRO";
  const isBasic = planType === "BASIC";
  const isFree = planType === "FREE";

  const canCreateClass = usage.classesCount < limits.maxClasses;

  const isPremiumTaskAllowed = (taskId: string) => {
    if (isPro) return true;
    return allowedPremiumTaskIds.includes(taskId);
  };

  const openUpgradeModal = (title?: string, description?: string) => {
    setModalConfig({ title, description });
    setModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setModalOpen(false);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        planType,
        limits,
        usage,
        allowedPremiumTaskIds,
        isPro,
        isBasic,
        isFree,
        canCreateClass,
        isPremiumTaskAllowed,
        openUpgradeModal,
        closeUpgradeModal,
        isLoading,
      }}
    >
      {children}
      {isTeacher && (
        <UpgradeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={modalConfig.title}
          description={modalConfig.description}
          currentPlanType={planType}
        />
      )}
    </SubscriptionContext.Provider>
  );
};

export const useTeacherSubscription = () => useContext(SubscriptionContext);
