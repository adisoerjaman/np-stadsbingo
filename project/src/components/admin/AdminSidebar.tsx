"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  ScrollText,
  UserCog,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  superAdminOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Teams",
    href: "/admin/teams",
    icon: Users,
  },
  {
    name: "Opdrachten",
    href: "/admin/assignments",
    icon: BookOpen,
  },
  {
    name: "Inzendingen",
    href: "/admin/review",
    icon: MessageSquare,
  },
  {
    name: "Audit log",
    href: "/admin/audit",
    icon: ScrollText,
  },
  {
    name: "Gebruikers",
    href: "/admin/users",
    icon: UserCog,
    superAdminOnly: true,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setIsSuperAdmin(Boolean(data?.isSuperAdmin)))
      .catch(() => {});
  }, []);

  const visibleItems = navigationItems.filter(
    (item) => !item.superAdminOnly || isSuperAdmin,
  );

  return (
    <aside className="w-80 bg-[#EAE2D5] shadow-sm pt-32 pb-10 px-6 hidden md:block min-h-screen">
      {/* Admin Welcome Section */}
      <div className="bg-[#FFE600] rounded-2xl p-5 mb-10">
        <h2 className="text-2xl font-extrabold text-[#2C2C2C]">Welkom,</h2>
        <p className="text-2xl font-bold text-[#2C2C2C]">Admin</p>
      </div>

      {/* Navigation Section */}
      <div>
        <h3 className="text-lg font-extrabold text-[#2C2C2C] mb-4">
          Navigatie
        </h3>
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-xl 
                  transition-all duration-200 ease-in-out
                  ${
                    isActive
                      ? "bg-[#FFE600] text-[#2C2C2C] font-semibold shadow-sm"
                      : "text-[#4B5563] hover:bg-white hover:text-[#2C2C2C] hover:shadow-sm"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-[#2C2C2C]"
                      : "text-[#6B7280] group-hover:text-[#2C2C2C]"
                  }`}
                />
                <span className="font-medium text-sm tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
