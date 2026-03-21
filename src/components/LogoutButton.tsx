'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface LogoutButtonProps {
	isCollapsed?: boolean
}

export default function LogoutButton({ isCollapsed }: LogoutButtonProps) {
	const [loading, setLoading] = useState(false)
	const supabase = createClient()

	const handleLogout = async (e: React.MouseEvent) => {
		e.preventDefault() // Stops any weird Sidebar click events from interfering
		if (loading) return // Prevents double-clicking

		setLoading(true)

		// THE FAIL-SAFE: No matter what happens, redirect after 1.5 seconds.
		const forceRedirect = setTimeout(() => {
			console.warn('Logout took too long, forcing redirect...')
			window.location.href = '/login'
		}, 1500)

		try {
			// Promise.allSettled runs both tasks simultaneously.
			// Even if one fails or hangs, it won't crash the other.
			await Promise.allSettled([supabase.auth.signOut(), fetch('/api/auth/logout', { method: 'POST' })])
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			// If the promises finish quickly, clear the timer and redirect instantly
			clearTimeout(forceRedirect)
			window.location.href = '/login'
		}
	}

	return (
		<button
			onClick={handleLogout}
			disabled={loading}
			className={clsx(
				'flex items-center gap-3 px-3 py-3 text-sm font-semibold transition-all w-full group disabled:opacity-50 cursor-pointer rounded-xl',
				'text-red-400/80 hover:bg-red-500/10 hover:text-red-400 mt-4',
				isCollapsed ? 'justify-center' : 'px-3',
			)}
		>
			<div className="relative">
				{loading ? (
					<Loader2 size={20} className="animate-spin" />
				) : (
					<LogOut size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
				)}
			</div>

			{!isCollapsed && <span className="tracking-wide whitespace-nowrap">{loading ? 'Signing out...' : 'Logout'}</span>}

			{isCollapsed && (
				<div className="hidden md:block absolute left-20 bg-red-900 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[100] border border-red-700 shadow-2xl">
					Logout
					<div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-red-900 border-l border-b border-red-700 rotate-45" />
				</div>
			)}
		</button>
	)
}
