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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/provider/RoleProvider";
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
      { name: "Packages", href: "/billing", icon: Package },
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
  const pathname = usePathname();
  const config = MENU_CONFIG[role as Role] || MENU_CONFIG["student"];
  const { data: myProfile } = useGetMyProfileQuery();
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
    <aside className="w-[220px] h-screen sticky left-0 top-0 flex flex-col bg-white border-r border-slate-100">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 px-6 py-[22px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3454FB]">
          <Book className="h-4 w-4 text-white" />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-slate-900">
          ESOL Master
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {config.main.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-150 relative",
                active
                  ? "bg-blue-50 text-[#3454FB]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#3454FB]" />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-[#3454FB]" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 space-y-1">
        {/* Separator */}
        <div className="h-px bg-slate-100 mx-2 mb-3" />

        {/* Upgrade / XP Card */}
        {role === "student" ? (
          <div className="mb-3 mx-1 space-y-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Next Level</span>
              <span>{(myProfile?.level ?? 0) + 1}</span>
            </div>
            <Progress value={myProfile?.progressPercentage || 0} className="h-1.5" />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>{myProfile?.totalXp || 0} XP</span>
              <span>{(myProfile?.xpNeededForNextLevel ?? 0) + (myProfile?.totalXp ?? 0)} XP</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 mx-1 rounded-2xl bg-gradient-to-br from-[#3454FB] to-[#2140E0] p-4 text-white shadow-sm shadow-blue-200">
            <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <p className="text-[13px] font-bold leading-tight">
              {role === "admin" ? "Upgrade to Premium!" : "Keep your workspace moving"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-blue-100">
              {role === "admin"
                ? "Unlock all admin features."
                : "Manage classes and support your learners."}
            </p>
            {role === "admin" && (
              <button className="mt-3 w-full rounded-xl bg-white py-1.5 text-[12px] font-bold text-[#3454FB] transition hover:bg-blue-50">
                Upgrade now
              </button>
            )}
          </div>
        )}

        {/* Settings & Help */}
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings className="h-[18px] w-[18px] text-slate-400" />
          Settings
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <HelpCircle className="h-[18px] w-[18px] text-slate-400" />
          Help &amp; Support
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isSignOutPending}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {isSignOutPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};
