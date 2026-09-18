"use client";

import { useRef, useState, useEffect } from "react";
import {
  Bell,
  CheckSquare,
  Clock,
  CreditCard,
  Trophy,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useGetMyNotifications,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/api/notification";
import { AppNotification, NotificationType } from "@/types/notification";

type TabKey = "All" | NotificationType;

const TAB_LABEL: Record<TabKey, string> = {
  All: "All",
  TASK_OPENED: "Tasks",
  TASK_ENDING_SOON: "Due Soon",
  SUBSCRIPTION_EXPIRING: "Billing",
  BADGE_EARNED: "Achievements",
  GENERAL: "System",
};

const TABS: TabKey[] = [
  "All",
  "TASK_OPENED",
  "TASK_ENDING_SOON",
  "SUBSCRIPTION_EXPIRING",
  "BADGE_EARNED",
  "GENERAL",
];

const ICON: Record<NotificationType, React.ReactNode> = {
  TASK_OPENED: <CheckSquare className="w-4 h-4" />,
  TASK_ENDING_SOON: <Clock className="w-4 h-4" />,
  SUBSCRIPTION_EXPIRING: <CreditCard className="w-4 h-4" />,
  BADGE_EARNED: <Trophy className="w-4 h-4" />,
  GENERAL: <AlertCircle className="w-4 h-4" />,
};

const ICON_BG: Record<NotificationType, string> = {
  TASK_OPENED: "bg-primary/10 text-primary",
  TASK_ENDING_SOON: "bg-amber-100 text-amber-600",
  SUBSCRIPTION_EXPIRING: "bg-red-100 text-red-600",
  BADGE_EARNED: "bg-yellow-100 text-yellow-600",
  GENERAL: "bg-gray-100 text-gray-600",
};

const NotifCard = ({
  item,
  onRead,
}: {
  item: AppNotification;
  onRead: (id: string) => void;
}) => (
  <div
    className="flex items-start gap-3 py-3 border-b border-border last:border-0 cursor-pointer"
    onClick={() => !item.isRead && onRead(item.id)}
  >
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ICON_BG[item.type]}`}
    >
      {ICON[item.type]}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`text-sm ${item.isRead ? "text-foreground/80" : "font-semibold text-foreground"}`}
      >
        {item.title}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>
    </div>
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </span>
      {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
    </div>
  </div>
);

export const Notification = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useGetMyNotifications(page, limit);
  const { mutate: markRead } = useMarkNotificationReadMutation();
  const { mutate: markAllRead, isPending: markingAll } =
    useMarkAllNotificationsReadMutation();

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeTab]);

  const notifications = data?.data ?? [];
  const filtered =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Notifications
        </h1>
        {(data?.unreadCount ?? 0) > 0 && (
          <button
            className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            onClick={() => markAllRead()}
            disabled={markingAll}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="relative flex border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[tab] = el;
              }}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors relative z-10 whitespace-nowrap
                ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "All" ? <Bell className="w-4 h-4" /> : ICON[tab]}
              {TAB_LABEL[tab]}
            </button>
          ))}
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        </div>

        {/* List */}
        <div className="p-5">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications here yet.
            </p>
          )}

          {!isLoading &&
            filtered.map((item) => (
              <NotifCard key={item.id} item={item} onRead={markRead} />
            ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-border py-3">
            <button
              className="text-sm text-muted-foreground disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              className="text-sm text-muted-foreground disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
