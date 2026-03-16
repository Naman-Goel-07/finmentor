'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Target, Sparkles, GraduationCap, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import clsx from 'clsx'

const navItems = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Expenses', href: '/expenses', icon: Receipt },
	{ name: 'Goals', href: '/goals', icon: Target },
	{ name: 'AI Coach', href: '/ai-coach', icon: Sparkles },
	{ name: 'Learning', href: '/learning', icon: GraduationCap },
]

// ✅ Add profile to the props interface
interface SidebarProps {
	isOpen?: boolean
	setIsOpen?: (val: boolean) => void
	userProfile: { name: string; avatar: string }
}

export default function Sidebar({ isOpen, setIsOpen, userProfile }: SidebarProps) {
	const pathname = usePathname()
	const [isCollapsed, setIsCollapsed] = useState(false)

	// Helper to get initials (e.g., "Naman Goel" -> "NG")
	const getInitials = (name: string) => {
		if (!name) return '??'
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<div
			className={clsx(
				'bg-[#020617] border-r border-slate-800/60 h-screen flex flex-col relative z-50 transition-all duration-300 ease-in-out md:static',
				'fixed inset-y-0 left-0 transform',
				isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
				isCollapsed ? 'md:w-20' : 'md:w-64 w-64',
			)}
		>
			{/* 🔝 LOGO SECTION */}
			<div
				className={clsx(
					'flex items-center h-16 border-b border-slate-800/60 transition-all duration-300',
					isCollapsed ? 'justify-center px-0' : 'justify-between px-6',
				)}
			>
				{!isCollapsed && (
					<div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
						FinMentor AI
					</div>
				)}

				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className={clsx(
						'hidden md:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer',
						isCollapsed && 'mx-auto',
					)}
				>
					{isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
				</button>

				<button onClick={() => setIsOpen && setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white p-2">
					<X size={24} />
				</button>
			</div>

			{/* 🧭 NAVIGATION */}
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

							{isCollapsed && (
								<div className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-slate-800 shadow-xl">
									{item.name}
								</div>
							)}
						</Link>
					)
				})}
			</nav>

			{/* 👤 DYNAMIC MINI PROFILE FOOTER */}
			<div className="p-4 border-t border-slate-800/60">
				<div
					className={clsx(
						'flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-300',
						isCollapsed ? 'justify-center' : 'bg-slate-900/40 border border-slate-800/40',
					)}
				>
					{/* Avatar / Initials */}
					<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden border border-slate-700">
						{userProfile.avatar ? (
							<img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
						) : (
							getInitials(userProfile.name)
						)}
					</div>

					{/* Dynamic Text */}
					{!isCollapsed && (
						<div className="overflow-hidden">
							<p className="text-xs font-bold text-slate-200 truncate italic">{userProfile.name || 'FinMentor User'}</p>
							<p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-bold">PRO PLAN</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
