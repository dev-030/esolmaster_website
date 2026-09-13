"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Book,
  LayoutDashboard,
  CheckSquare,
  Users,
  BarChart,
  User,
  LogOut,
  Package,
  ClipboardList,
  GraduationCap,
  Trophy,
  Folder,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/provider/RoleProvider";
import { useGetMyProfileQuery, useSignOutMutation } from "@/api/auth";
import { toast } from "sonner";
type Role = "admin" | "student" | "teacher"; // Extendable for future roles

const MENU_CONFIG = {
  student: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Browse Task", href: "/tasks", icon: CheckSquare },
      { name: "Classes", href: "/classes", icon: Users },
      { name: "My Progress", href: "/progress", icon: BarChart },
      { name: "Badges", href: "/badges", icon: Trophy },
    ],
    account: [{ name: "Profile", href: "/profile", icon: User }],
  },
  teacher: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Activity Library", href: "/content-library", icon: CheckSquare },
      { name: "Classes", href: "/classes", icon: Users },
      { name: "Students", href: "/students", icon: GraduationCap },
      { name: "Reports", href: "/report", icon: BarChart },
    ],
    account: [{ name: "Profile", href: "/profile_teacher", icon: User }],
  },
  admin: {
    main: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "User Management", href: "/users", icon: Users },
      { name: "Content Library", href: "/content-library", icon: Folder },
      { name: "Performance", href: "/perfomance", icon: BarChart },
      { name: "Packages", href: "/billing", icon: Package },
      { name: "Analytics", href: "/analysis", icon: BarChart },
      { name: "Reports", href: "/admin_reports", icon: ClipboardList },
      { name: "Badges", href: "/badges", icon: Trophy },
    ],
    account: [
      { name: "Profile", href: "/admin_profile", icon: User },
    ],
  },
};

export const Sidebar = () => {
  const {role} = useRole();
  const pathname = usePathname();
  const config = MENU_CONFIG[role as Role] || MENU_CONFIG["student"]; // Fallback to student config
  const { data: myProfile } = useGetMyProfileQuery();
  const { mutateAsync: signOut, isPending: isSignOutPending } = useSignOutMutation();
  const router = useRouter();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <aside
      className={cn(
        "w-64 h-screen sticky left-0 top-0 flex flex-col border-r border-slate-200 bg-white text-slate-900 transition-colors",
      )}
    >
      {/* Top Brand */}
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F7EDA] shadow-sm shadow-blue-200">
            <Book className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-slate-900">ESOL Master</p>
            <p className="text-[11px] font-medium text-slate-400">Learning workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-3 py-6">
        {/* Main Menu */}
        <div>
          <p
            className={cn(
              "mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400",
            )}
          >
            Main Menu
          </p>
          <div className="space-y-1">
            {config.main.map((item) => (
              <div key={item.name} className="flex flex-col">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "bg-[#EAF2FF] font-semibold text-[#2F7EDA] shadow-sm"
                      : "hover:bg-slate-100",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Account Menu */}
        <div>
          <p
            className={cn(
              "mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400",
            )}
          >
            Account
          </p>
          <div className="space-y-1">
            {config.account.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive(item.href)
                      ? "bg-[#EAF2FF] font-semibold text-[#2F7EDA] shadow-sm"
                    : "hover:bg-slate-100",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-slate-100 p-4">
        {role === "student" && (
          <div className="mb-4 space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex justify-between text-xs font-bold">
              <span>Next Level</span>
              <span>{myProfile?.level+1 || 1}</span>
            </div>
            <Progress value={myProfile?.progressPercentage || 0} className="h-2" />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{myProfile?.totalXp || 0} XP</span>
              <span>{myProfile?.xpNeededForNextLevel+myProfile?.totalXp || 0} XP</span>
            </div>
          </div>
        )}

        {role !== "student" && (
          <div className="mb-4 rounded-xl bg-gradient-to-br from-[#2F7EDA] to-[#1D5EAE] p-4 text-white shadow-sm">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">Keep your workspace moving</p>
            <p className="mt-1 text-[11px] leading-relaxed text-blue-100">
              {role === "admin" ? "Review content and platform activity." : "Manage classes and support your learners."}
            </p>
          </div>
        )}

        <button 
          onClick={handleLogout}
          disabled={isSignOutPending}
          className="flex items-center gap-2 text-sm text-red-500 font-medium mt-4 w-full px-2 hover:bg-red-50 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {isSignOutPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
};
