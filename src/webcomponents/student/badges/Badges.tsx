/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as Icons from "lucide-react";
import { BadgeCard, BadgeItem } from "./BadgeCard";
import { SectionHeading } from "../../reusable/SectionHeading";
import { useGetMyBadgesQuery } from "@/api/badge";

export const Badges = () => {
  const { data = [], isLoading } = useGetMyBadgesQuery();

  const badges: BadgeItem[] = data.map((item: any) => {
    const Icon = (Icons as any)[item.badge.iconName] || Icons.Award;

    const config = item.badge.conditionConfig;

    const target =
      config.targetTasks ||
      config.targetXp ||
      config.targetDays ||
      config.targetAttempts ||
      config.consecutiveTasks ||
      config.minPercentage ||
      1;

    const progress = Math.min(
      Math.round((item.progress / target) * 100),
      100,
    );

    return {
      icon: <Icon />,
      title: item.badge.name,
      subtitle: item.badge.description,
      completed: !!item.earnedAt,
      progress,
      progressLabel: `${item.progress}/${target}`,
      iconColor: "text-yellow-500",
    };
  });

  const completed = badges.filter((b) => b.completed).length;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        heading="Badges & Achievements"
        subheading={`You've unlocked ${completed} of ${badges.length} badges. Keep going!`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge, i) => (
          <BadgeCard key={i} badge={badge} />
        ))}
      </div>
    </div>
  );
};