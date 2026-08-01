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
      { name: "My Task", href: "/content-library", icon: CheckSquare },
      { name: "Assign Task", href: "/assign-task", icon: ClipboardList },
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
  const isAdmin = role === "admin";
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
        "w-64 h-screen sticky left-0 top-0 flex flex-col border-r transition-colors",
        isAdmin
          ? "bg-[#1E2230] text-white border-none"
          : "bg-white text-slate-900",
      )}
    >
      {/* Top Brand */}
      <div className="p-6">
        <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center">
          <Book className="text-white w-6 h-6" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {/* Main Menu */}
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wider mb-4 px-2",
              isAdmin ? "text-slate-400" : "text-slate-500",
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
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium",
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : isAdmin
                        ? "hover:bg-slate-800"
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
              "text-xs font-semibold uppercase tracking-wider mb-4 px-2",
              isAdmin ? "text-slate-400" : "text-slate-500",
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
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-medium",
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : isAdmin
                      ? "hover:bg-slate-800"
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
      <div className="p-4 border-t border-slate-200/20">
        {role === "student" && (
          <div className="space-y-3 bg-linear-to-br from-[#8EC2FF99] to [#2475D396] p-4 rounded-lg mb-4">
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
