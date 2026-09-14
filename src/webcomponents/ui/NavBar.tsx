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
  Search,
  Sun,
  Zap,
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
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors outline-none">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border border-slate-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="text-xs text-[#3454FB] font-semibold cursor-pointer hover:underline"
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
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-[#3454FB]" />
            </div>
          )}
          {!isLoading && notifications.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">
              You&apos;re all caught up.
            </p>
          )}
          {notifications.map((notif: AppNotification) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer focus:bg-slate-50 rounded-none"
              onClick={() => {
                if (!notif.isRead) markRead(notif.id);
              }}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${ICON_BG[notif.type]}`}
              >
                {ICON[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs leading-snug ${notif.isRead ? "text-slate-500 font-normal" : "text-slate-900 font-bold"}`}
                >
                  {notif.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {notif.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3454FB] shrink-0 mt-2" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="m-0" />

        <DropdownMenuItem className="rounded-none focus:bg-slate-50 p-0">
          <Link
            href="/notification"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#3454FB] w-full cursor-pointer"
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

  const userInitials =
    `${myProfile?.firstName?.charAt(0) ?? ""}${myProfile?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "U";

  return (
    <nav className="h-[68px] border-b border-slate-100/90 bg-white flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
      {/* Left: Search input (Shopeers style) */}
      <div className="relative w-72 max-w-sm hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full h-9 pl-10 pr-10 text-xs font-medium bg-slate-50/70 border border-slate-200/70 rounded-[12px] focus:bg-white focus:border-[#3454FB] focus:outline-none transition-all placeholder:text-slate-400"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-400">
          ⌘K
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Student XP Badge */}
        {role === "student" && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50/80 border border-blue-100 px-3 py-1 text-xs font-bold text-[#3454FB]">
            <Zap className="h-3.5 w-3.5 fill-[#3454FB]" />
            <span>{myProfile?.totalXp || 0} XP</span>
          </div>
        )}

        {/* Theme button placeholder (Shopeers style) */}
        <button
          type="button"
          aria-label="Toggle theme"
          className="h-9 w-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Sun className="h-4 w-4" />
        </button>

        {/* Notification dropdown */}
        <NotificationDropdown />

        {/* User Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 outline-none pl-1 cursor-pointer">
            <Avatar className="h-9 w-9 rounded-full ring-2 ring-slate-100">
              <AvatarFallback className="bg-[#3454FB] text-white text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl border border-slate-100 shadow-xl p-1.5">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {myProfile?.firstName} {myProfile?.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{myProfile?.email}</p>
            </div>
            <DropdownMenuItem className="rounded-xl cursor-pointer">
              <Link href={profileRoute} className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full">
                <User className="w-3.5 h-3.5 text-slate-400" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              onClick={() =>
                signOut(undefined, {
                  onSuccess: () => {
                    router.refresh();
                    router.push("/login");
                  },
                })
              }
              className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl cursor-pointer text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
