"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Settings, Brain } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function Sidebar({ userEmail }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/subjects", label: "Mis Materias", icon: BookOpen },
    { href: "/analytics", label: "Métricas", icon: Settings },
  ];

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-brand-teal text-white flex flex-col hidden md:flex fixed h-full">
      <div className="h-16 flex items-center px-6 border-b border-brand-steel/30">
        <Brain className="h-6 w-6 text-brand-pink mr-2" />
        <span className="text-xl font-bold tracking-tight">AcademIA</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive(href)
                ? "bg-white/20 text-white"
                : "hover:bg-white/10 text-brand-blush"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-brand-steel/30">
        <div className="flex items-center gap-3 px-4 py-3 text-sm">
          <div className="h-8 w-8 rounded-full bg-brand-pink flex items-center justify-center font-bold text-brand-taupe shrink-0">
            {userEmail?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 truncate">
            <span className="block truncate">{userEmail || "Usuario"}</span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
