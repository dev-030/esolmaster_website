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
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="flex items-center justify-between px-5 py-[18px]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#3454FB] shadow-sm shadow-blue-500/20">
            <Book className="h-4 w-4 text-white" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-slate-900">
            ESOL Master
          </span>
        </div>

        <button
          type="button"
          aria-label="Collapse sidebar"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
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
                  ? "bg-blue-50/70 text-[#3454FB]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {/* Active left indicator bar (Shopeers style) */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#3454FB]" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-[#3454FB]" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 pt-2 space-y-1">
        {/* Upgrade Card (Shopeers Royal Blue Gradient Card) */}
        <div className="mb-3 mx-1 rounded-[18px] bg-gradient-to-br from-[#1C3DB6] via-[#142987] to-[#0A1647] p-4 text-white shadow-md shadow-blue-900/10">
          <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/15 backdrop-blur-xs">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-[13px] font-bold leading-snug text-white">
            Upgrade to Premium!
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-blue-100/80">
            Unlock advanced activities, detailed analytics & full AI features.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-[10px] bg-gradient-to-r from-[#3454FB] to-[#4F6CFF] py-1.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
          >
            Upgrade premium
          </button>
        </div>

        {/* Settings & Help */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-[12px] px-3.5 py-2 text-[13.5px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings className="h-[18px] w-[18px] text-slate-400" />
          Settings
        </Link>
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-[12px] px-3.5 py-2 text-[13.5px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <HelpCircle className="h-[18px] w-[18px] text-slate-400" />
          Help &amp; Support
        </Link>

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
