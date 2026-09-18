"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Book,
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart2,
  User,
  LogOut,
  Package,
  ClipboardList,
  GraduationCap,
  Trophy,
  Folder,
  Settings,
  HelpCircle,
  Sparkles,
  Zap,
  Star,
  Shield,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/provider/RoleProvider";
import { useTeacherSubscription } from "@/provider/SubscriptionProvider";
import { useGetMyProfileQuery, useSignOutMutation } from "@/api/auth";
import { toast } from "sonner";

type Role = "admin" | "student" | "teacher";

const MENU_CONFIG = {
  student: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Browse Tasks", href: "/tasks", icon: CheckSquare },
      { name: "Classes", href: "/classes", icon: Users },
      { name: "My Progress", href: "/progress", icon: BarChart2 },
      { name: "Badges", href: "/badges", icon: Trophy },
    ],
    bottom: [
      { name: "Profile", href: "/profile", icon: User },
    ],
  },
  teacher: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Activity Library", href: "/content-library", icon: CheckSquare },
      { name: "Classes", href: "/classes", icon: Users },
      { name: "Students", href: "/students", icon: GraduationCap },
      { name: "Reports", href: "/report", icon: BarChart2 },
    ],
    bottom: [
      { name: "Profile", href: "/profile_teacher", icon: User },
    ],
  },
  admin: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "User Management", href: "/users", icon: Users },
      { name: "Content Library", href: "/content-library", icon: Folder },
      { name: "Performance", href: "/perfomance", icon: BarChart2 },
      { name: "Packages", href: "/packages", icon: Package },
      { name: "Analytics", href: "/analysis", icon: BarChart2 },
      { name: "Reports", href: "/admin_reports", icon: ClipboardList },
      { name: "Badges", href: "/badges", icon: Trophy },
    ],
    bottom: [
      { name: "Profile", href: "/admin_profile", icon: User },
    ],
  },
};

export const Sidebar = () => {
  const { role } = useRole();
  const { planType, isPro, isBasic, limits, usage, openUpgradeModal } = useTeacherSubscription();
  const pathname = usePathname();
  const config = MENU_CONFIG[role as Role] || MENU_CONFIG["student"];
  const { mutateAsync: signOut, isPending: isSignOutPending } = useSignOutMutation();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <aside className="w-[230px] h-screen sticky left-0 top-0 flex flex-col bg-white border-r border-slate-100/90 z-30 select-none">
      {/* Brand Logo & Collapse */}
      <div className="flex items-center justify-between px-5 pt-[18px] pb-8">
        <div className="flex items-center">
          <img src="/logo.png" alt="ESOL Master" className="h-8 w-auto object-contain" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {config.main.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {/* Active left indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-primary" : "text-slate-600 group-hover:text-slate-800"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100/80 bg-slate-50/30">
        {/* Subscription Plan Card (Teachers) */}
        {role === "teacher" && (() => {
          const planIcon = isPro ? Zap : isBasic ? Star : Shield;
          const planIconStyle = isPro
            ? "bg-[#007EEF]/10 border-[#007EEF]/20 text-[#007EEF]"
            : isBasic
            ? "bg-blue-50 border-blue-200/60 text-blue-600"
            : "bg-slate-100 border-slate-200/60 text-slate-600";
          const planBadgeStyle = isPro
            ? "bg-[#007EEF]/10 text-[#007EEF] border border-[#007EEF]/20"
            : isBasic
            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
            : "bg-slate-100 text-slate-600 border border-slate-200/60";
          const Icon = planIcon;
          const maxClasses = limits.maxClasses || 1;
          const classPct = Math.min(100, Math.round((usage.classesCount / maxClasses) * 100));

          return (
            <div className="mb-3 mx-1 rounded-xl bg-white border border-slate-200/80 p-3.5 shadow-none transition-all hover:border-slate-300 text-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border shrink-0", planIconStyle)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight text-slate-900 tracking-tight">
                      {isPro ? "Pro Plan" : isBasic ? "Basic Plan" : "Free Plan"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{usage.classesCount}</span> / {limits.maxClasses} classes used
                    </p>
                  </div>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide border", planBadgeStyle)}>
                  {planType}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 my-2.5 overflow-hidden">
                <div
                  className="bg-[#007EEF] h-full rounded-full transition-all duration-300"
                  style={{ width: `${classPct}%` }}
                />
              </div>

              {isPro ? (
                <Link
                  href="/profile_teacher/billing_info"
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-200/80 bg-slate-50/70 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer shadow-none"
                >
                  Manage Subscription
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openUpgradeModal("Upgrade Your Classroom", "Create more classes, enroll more students, and unlock all premium activities.")}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#007EEF] py-1.5 text-xs font-medium text-white transition hover:bg-[#0066cc] cursor-pointer shadow-none"
                  style={{ boxShadow: "none" }}
                >
                  Upgrade to Pro
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })()}

        {/* Settings & Help */}
        {(() => {
          const settingsHref = config.bottom[0]?.href || "/profile";
          const isSettingsActive =
            isActive(settingsHref) ||
            pathname === "/admin_profile" ||
            pathname.startsWith("/admin_profile/") ||
            pathname === "/profile_teacher" ||
            pathname.startsWith("/profile_teacher/") ||
            pathname === "/profile" ||
            pathname.startsWith("/profile/");
          const isHelpActive = isActive("/help");

          return (
            <>
              <Link
                href={settingsHref}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-150",
                  isSettingsActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                {isSettingsActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                )}
                <Settings
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isSettingsActive ? "text-primary" : "text-slate-600 group-hover:text-slate-800"
                  )}
                />
                <span className="truncate">Settings</span>
              </Link>

              {role !== "teacher" && (
                <Link
                  href="/help"
                  className={cn(
                    "group relative flex items-center gap-3 rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-all duration-150",
                    isHelpActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {isHelpActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <HelpCircle
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      isHelpActive ? "text-primary" : "text-slate-600 group-hover:text-slate-800"
                    )}
                  />
                  <span className="truncate">Help &amp; Support</span>
                </Link>
              )}
            </>
          );
        })()}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isSignOutPending}
          className="flex w-full items-center gap-3 rounded-[12px] px-3.5 py-2 text-[13.5px] font-semibold text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {isSignOutPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};
