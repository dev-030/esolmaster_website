/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as Icons from "lucide-react";
import { BadgeCard, BadgeItem } from "./BadgeCard";
import { useGetMyBadgesQuery } from "@/api/badge";
import { Award, Loader2 } from "lucide-react";

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
      iconColor: "text-amber-500",
    };
  });

  const completed = badges.filter((b) => b.completed).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Badges & Achievements
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Collect badges by completing activities, keeping learning streaks, and earning XP
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary">
          <Award className="w-4 h-4" />
          <span>
            {completed} of {badges.length} unlocked
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge, i) => (
          <BadgeCard key={i} badge={badge} />
        ))}
      </div>
    </div>
  );
};