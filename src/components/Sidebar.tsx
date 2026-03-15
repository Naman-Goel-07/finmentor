"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Target, Sparkles, GraduationCap, X } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "AI Coach", href: "/ai-coach", icon: Sparkles },
  { name: "Learning", href: "/learning", icon: GraduationCap },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <div className={clsx(
      "bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col gap-2 relative z-50 transition-transform duration-300 md:translate-x-0 md:static md:w-64",
      "fixed inset-y-0 left-0 w-64 transform",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex justify-between items-center mb-8 px-4 mt-4">
        <div className="font-bold text-2xl text-gray-900">
          FinMentor AI
        </div>
        <button 
          onClick={() => setIsOpen && setIsOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium min-h-[44px]",
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
