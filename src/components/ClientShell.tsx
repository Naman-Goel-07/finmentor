'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, User, LogOut, ChevronDown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

// ✅ INITIALIZE OUTSIDE: Ensures stability across re-renders.
const supabase = createClient()

export default function ClientShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [isMounted, setIsMounted] = useState(false) // ✅ Hydration Guard
	const { user, loading, setUser } = useAuth()
	const pathname = usePathname()

	// 1. Set mounted state to true once we hit the browser
	useEffect(() => {
		setIsMounted(true)
	}, [])

	const isAuthPage = pathname === '/login' || pathname === '/signup'

	// 2. Real-time Profile Sync
	useEffect(() => {
		if (!user || isAuthPage) return

		const channel = supabase
			.channel(`profile-update-${user.id}`)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE',
					schema: 'public',
					table: 'profiles',
					filter: `id=eq.${user.id}`,
				},
				(payload) => {
					if (payload?.new && payload.new.full_name) {
						setUser((prev) => (prev ? { ...prev, full_name: payload.new.full_name } : prev))
					}
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [user, setUser, isAuthPage])

	// 3. Handle Auth Pages immediately
	if (isAuthPage) return <div className="bg-[#020617] min-h-screen text-slate-200">{children}</div>

	// 4. THE HYDRATION SHIELD
	// If we haven't mounted in the browser yet, return the children (the server-rendered HTML).
	// This prevents the "Warming up" screen from wiping out the dashboard
	// before the client auth has even started.
	if (!isMounted) {
		return <div className="bg-[#020617] min-h-screen">{children}</div>
	}

	// 5. THE PRODUCTION LOADING CHECK
	// Only block if we are DEFINITELY mounted, still LOADING, and have NO user data.
	if (loading && !user) {
		return (
			<div className="flex bg-[#020617] h-screen w-full items-center justify-center flex-col gap-4 text-slate-300">
				<Loader2 className="animate-spin text-emerald-500" size={48} />
				<p className="font-semibold tracking-wide animate-pulse">Warming up your dashboard...</p>
			</div>
		)
	}

	const handleLogout = async () => {
		setProfileOpen(false)
		try {
			await supabase.auth.signOut()
			await fetch('/api/auth/logout', { method: 'POST' })
		} finally {
			window.location.href = '/login'
		}
	}

	const firstName = user?.full_name?.trim().split(' ')[0] || 'User'

	return (
		<div className="flex h-screen w-full relative bg-[#020617] text-slate-200 selection:bg-blue-500/30 overflow-hidden">
			<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

			<div className="flex-1 flex flex-col h-screen min-w-0 w-full overflow-hidden relative">
				<header className="bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 h-16 flex items-center shrink-0 z-30">
					<div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSidebarOpen(true)}
								aria-label="Open sidebar"
								className="md:hidden text-slate-400 cursor-pointer p-2 hover:bg-slate-800 rounded-xl transition-all outline-none"
							>
								<Menu size={20} />
							</button>
							<h1 className="font-bold text-xl text-white md:hidden tracking-tight">FinMentor AI</h1>
						</div>

						<div className="hidden md:block text-sm text-slate-400 font-medium italic">Welcome back, {firstName}! 👋</div>

						<div className="relative">
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								aria-expanded={profileOpen}
								className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all cursor-pointer outline-none group"
							>
								<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white border-2 border-slate-800 shadow-lg overflow-hidden shrink-0">
									<User size={20} />
								</div>
								<ChevronDown size={14} className={clsx('text-slate-500 transition-transform duration-300', profileOpen && 'rotate-180')} />
							</button>

							{profileOpen && (
								<>
									<div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
									<div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-1.5 z-20 animate-in fade-in zoom-in duration-200">
										<div className="px-3 py-2 border-b border-slate-800 mb-1">
											<p className="text-sm font-bold text-white truncate">{user?.full_name || user?.email || 'User'}</p>
										</div>
										<Link
											href="/profile"
											className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
											onClick={() => setProfileOpen(false)}
										>
											<User size={16} /> Profile Settings
										</Link>
										<div className="h-px bg-slate-800 my-1 mx-2" />
										<button
											onClick={handleLogout}
											className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer text-left font-medium"
										>
											<LogOut size={16} /> Log Out
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto bg-[#020617] relative">
					<div className="max-w-6xl mx-auto w-full p-4 md:p-8 min-h-full overflow-x-hidden">{children}</div>
				</main>

				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</div>
		</div>
	)
}
