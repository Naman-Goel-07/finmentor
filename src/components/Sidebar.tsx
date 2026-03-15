"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Target, Sparkles, GraduationCap } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { name: "Learning", href: "/learning", icon: GraduationCap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col gap-2 relative z-10 hidden md:flex">
      <div className="font-bold text-2xl text-gray-900 mb-8 px-4 mt-4">
        FinMentor AI
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive ? "text-blue-700" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
