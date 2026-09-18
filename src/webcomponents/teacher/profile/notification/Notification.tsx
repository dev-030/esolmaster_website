"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: "new_assignment", title: "New Assignment",     description: "Get notified when a new assignment is posted.",          enabled: true  },
  { id: "submission",     title: "Student Submission", description: "Receive alerts when a student submits their work.",       enabled: true  },
  { id: "due_reminder",   title: "Due Date Reminder",  description: "Reminders 24 hours before an assignment is due.",        enabled: false },
  { id: "grade_update",   title: "Grade Published",    description: "Notify students when grades are published.",             enabled: true  },
  { id: "messages",       title: "New Messages",       description: "Alert when you receive a new message from a student.",   enabled: true  },
  { id: "class_update",   title: "Class Updates",      description: "Announcements and updates related to your classes.",     enabled: false },
  { id: "system",         title: "System Notifications", description: "Platform maintenance and important system alerts.",    enabled: true  },
  { id: "weekly_report",  title: "Weekly Report",      description: "Receive a weekly summary of class performance.",         enabled: false },
];

export const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const toggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-none overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200/70">
        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
        <p className="text-xs text-slate-400 mt-0.5">Choose which alerts you want to receive.</p>
      </div>

      {/* Items */}
      <div>
        {notifications.map((item, idx) => (
          <div key={item.id}>
            <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-700">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <Switch
                checked={item.enabled}
                onCheckedChange={() => toggle(item.id)}
                className="ml-4 shrink-0"
              />
            </div>
            {idx < notifications.length - 1 && <Separator className="bg-slate-100" />}
          </div>
        ))}
      </div>
    </div>
  );
};