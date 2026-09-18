"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bell, ShieldCheck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export const SettingsBar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Profile Information", href: "/profile_teacher/edit_profile", icon: User },
    { label: "Notification",        href: "/profile_teacher/notification",  icon: Bell },
    { label: "Security",            href: "/profile_teacher/security",      icon: ShieldCheck },
    { label: "Billing Information", href: "/profile_teacher/billing_info",  icon: CreditCard },
  ];

  return (
    <div className="w-full md:max-w-[260px] bg-white rounded-xl border border-slate-200/70 p-2 shadow-none shrink-0">
      <nav className="flex flex-col max-md:flex-row gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-[13px] font-semibold transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                size={16}
                strokeWidth={2}
                className={isActive ? "text-primary" : "text-slate-400"}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
