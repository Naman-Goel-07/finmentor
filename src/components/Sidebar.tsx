'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Receipt, Target, Sparkles, GraduationCap, X, PanelLeftClose, PanelLeftOpen, LogOut, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import supabase from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

const navItems = [
	{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ name: 'Expenses', href: '/expenses', icon: Receipt },
	{ name: 'Goals', href: '/goals', icon: Target },
	{ name: 'AI Coach', href: '/ai-coach', icon: Sparkles },
	{ name: 'Learning', href: '/learning', icon: GraduationCap },
]

interface SidebarProps {
	isOpen?: boolean
	setIsOpen?: (val: boolean) => void
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const { user } = useAuth() // Get user from our context
	const [isCollapsed, setIsCollapsed] = useState(false)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const getInitials = (name: string) => {
		if (!name) return '??'
		const parts = name.split(' ')
		if (parts.length === 1) return name.slice(0, 2).toUpperCase()
		return (parts[0][0] + (parts[parts.length - 1]?.[0] || '')).toUpperCase()
	}

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await supabase.auth.signOut()
			const response = await fetch('/api/auth/logout', { method: 'POST' })
			if (response.ok) {
				router.push('/login')
				router.refresh()
			}
		} catch (error) {
			console.error('Logout failed:', error)
			setIsLoggingOut(false)
		}
	}

	return (
		<div
			className={clsx(
				'fixed inset-y-0 left-0 z-50 bg-[#020617] border-r border-slate-800/60 flex flex-col transition-all duration-300 ease-in-out',
				'md:relative md:translate-x-0 overflow-visible',
				isOpen ? 'translate-x-0' : '-translate-x-full',
				isCollapsed ? 'w-20' : 'w-64',
			)}
		>
			{/* LOGO SECTION */}
			<div
				className={clsx(
					'flex items-center h-16 border-b border-slate-800/60 transition-all duration-300 relative group/logo',
					isCollapsed ? 'justify-center px-0' : 'justify-between px-6',
				)}
			>
				{!isCollapsed && (
					<div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter whitespace-nowrap">
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

			{/* NAVIGATION */}
			<nav className="flex-1 space-y-1.5 p-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
				{navItems.map((item) => {
					const isActive = pathname === item.href
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
							{!isCollapsed && <span className="font-semibold text-sm tracking-wide whitespace-nowrap">{item.name}</span>}

							{isCollapsed && (
								<div className="hidden md:block absolute left-20 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[100] border border-slate-700 shadow-2xl">
									{item.name}
									<div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
								</div>
							)}
						</Link>
					)
				})}

				{/* LOGOUT BUTTON IN NAV LIST */}
				<button
					onClick={handleLogout}
					disabled={isLoggingOut}
					className={clsx(
						'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-red-400/80 hover:bg-red-500/10 hover:text-red-400 mt-4',
						isCollapsed && 'justify-center',
					)}
				>
					{isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5 shrink-0" />}
					{!isCollapsed && <span className="font-semibold text-sm tracking-wide">Logout</span>}

					{isCollapsed && (
						<div className="hidden md:block absolute left-20 bg-red-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[100] border border-red-700 shadow-2xl">
							Logout
							<div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-900 border-l border-b border-red-700 rotate-45" />
						</div>
					)}
				</button>
			</nav>

			{/* MINI PROFILE FOOTER */}
			<div className="p-4 border-t border-slate-800/60 group/profile relative">
				<div
					className={clsx(
						'flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-300',
						isCollapsed ? 'justify-center' : 'bg-slate-900/40 border border-slate-800/40',
					)}
				>
					<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden border border-slate-700">
						{user?.full_name ? getInitials(user.full_name) : '??'}
					</div>

					{!isCollapsed && (
						<div className="overflow-hidden whitespace-nowrap flex-1">
							<p className="text-xs font-bold text-slate-200 truncate italic">{user?.full_name || 'FinMentor User'}</p>
							<p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter font-bold">PRO PLAN</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
