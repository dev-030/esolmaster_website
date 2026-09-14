"use client";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Trophy,
  CheckSquare,
  Clock,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRole } from "@/provider/RoleProvider";
import { useRouter } from "next/navigation";
import { useGetMyProfileQuery, useSignOutMutation } from "@/api/auth";
import {
  useGetMyNotifications,
  useGetUnreadNotificationCount,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/api/notification";
import { AppNotification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";

type Role = "admin" | "student" | "teacher";

const ICON: Record<NotificationType, React.ReactNode> = {
  TASK_OPENED: <CheckSquare className="w-4 h-4 text-blue-500" />,
  TASK_ENDING_SOON: <Clock className="w-4 h-4 text-amber-500" />,
  SUBSCRIPTION_EXPIRING: <CreditCard className="w-4 h-4 text-red-500" />,
  BADGE_EARNED: <Trophy className="w-4 h-4 text-yellow-500" />,
  GENERAL: <AlertCircle className="w-4 h-4 text-slate-400" />,
};

const ICON_BG: Record<NotificationType, string> = {
  TASK_OPENED: "bg-blue-50",
  TASK_ENDING_SOON: "bg-amber-50",
  SUBSCRIPTION_EXPIRING: "bg-red-50",
  BADGE_EARNED: "bg-yellow-50",
  GENERAL: "bg-slate-100",
};

const NotificationDropdown = () => {
  const { data: unread } = useGetUnreadNotificationCount();
  const { data: list, isLoading } = useGetMyNotifications(1, 8);
  const { mutate: markRead } = useMarkNotificationReadMutation();
  const { mutate: markAllRead } = useMarkAllNotificationsReadMutation();

  const unreadCount = unread?.unreadCount ?? 0;
  const notifications = list?.data ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative outline-none">
        <Bell className="w-5 h-5 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-[9px] font-bold leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="text-xs text-primary font-medium cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
            >
              Mark all as read
            </span>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && notifications.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              You&apos;re all caught up.
            </p>
          )}
          {notifications.map((notif: AppNotification) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-muted/60 rounded-none"
              onClick={() => {
                if (!notif.isRead) markRead(notif.id);
              }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ICON_BG[notif.type]}`}
              >
                {ICON[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${notif.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}
                >
                  {notif.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {notif.message}
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <DropdownMenuItem className="rounded-none focus:bg-muted/60 p-0">
          <Link
            href="/notification"
            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-primary w-full cursor-pointer"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const Navbar = () => {
  const router = useRouter();
  const { role } = useRole();
  const { mutate: signOut } = useSignOutMutation();
  const { data: myProfile } = useGetMyProfileQuery();
  if (!role) return null;
  const profileRoute =
    {
      admin: "/admin_profile",
      teacher: "/profile_teacher",
      student: "/profile",
    }[role as Role] ?? "/profile";

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-end px-8 gap-6 sticky top-0 z-10">
      {role === "student" && (
        <>
          <div className="font-bold text-primary">{myProfile?.totalXp || 0} XP</div>
          <div className="h-8 w-px bg-slate-200" />
        </>
      )}

      {/* Notification dropdown — all roles */}
      <NotificationDropdown />

      {/* Avatar / profile menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-white">
             {myProfile?.firstName?.charAt(0).toUpperCase()}{myProfile?.lastName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Link href={profileRoute} className="flex items-center gap-2">
              <User className="w-4 h-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              signOut(undefined, {
                onSuccess: () => {
                  router.refresh();
                  router.push("/login");
                },
              })
            }
            className="text-red-500 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};
