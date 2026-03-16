'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Target, Sparkles, GraduationCap, X, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Expenses', href: '/expenses', icon: Receipt },
	{ name: 'Goals', href: '/goals', icon: Target },
	{ name: 'AI Coach', href: '/ai-coach', icon: Sparkles },
	{ name: 'Learning', href: '/learning', icon: GraduationCap },
]

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean; setIsOpen?: (val: boolean) => void }) {
	const pathname = usePathname()
	const [isCollapsed, setIsCollapsed] = useState(false) // ✅ Folding state

	return (
		<div
			className={clsx(
				// Background & Border updated to match Global Dark theme
				'bg-[#020617] border-r border-slate-800/60 min-h-screen flex flex-col relative z-50 transition-all duration-300 ease-in-out md:static',
				'fixed inset-y-0 left-0 transform',
				isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
				// Width toggle logic
				isCollapsed ? 'md:w-20' : 'md:w-64 w-64',
			)}
		>
			{/* 🔝 LOGO SECTION */}
			<div className="flex justify-between items-center h-16 px-6 border-b border-slate-800/60">
				{!isCollapsed && (
					<div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic tracking-tighter">
						FinMentor AI
					</div>
				)}
				{isCollapsed && <div className="font-black text-blue-500 text-xl mx-auto">F</div>}

				<button
					onClick={() => setIsOpen && setIsOpen(false)}
					className="md:hidden text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
				>
					<X size={24} />
				</button>
			</div>

			{/* 🧭 NAVIGATION LINKS */}
			<nav className="flex-1 space-y-2 p-4">
				{navItems.map((item) => {
					const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard')
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={() => setIsOpen && setIsOpen(false)}
							className={clsx(
								'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative',
								isActive
									? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
									: 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
							)}
						>
							<item.icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-blue-400' : 'group-hover:text-slate-100')} />

							{!isCollapsed && <span className="font-semibold text-sm tracking-wide">{item.name}</span>}

							{/* Tooltip for collapsed mode */}
							{isCollapsed && (
								<div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-slate-800 shadow-xl">
									{item.name}
								</div>
							)}
						</Link>
					)
				})}
			</nav>

			{/* 🛠️ COLLAPSE TOGGLE (Desktop Only) */}
			<div className="p-4 border-t border-slate-800/60 hidden md:block">
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="w-full flex items-center justify-center p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
				>
					{isCollapsed ? (
						<ChevronRight size={20} />
					) : (
						<div className="flex items-center gap-2">
							<ChevronLeft size={18} />
							<span className="text-xs font-bold uppercase tracking-widest">Collapse</span>
						</div>
					)}
				</button>
			</div>
		</div>
	)
}
