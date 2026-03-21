'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Loader2 } from 'lucide-react'

export default function LogoutButton() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const supabase = createClient()

	const handleLogout = async () => {
		setLoading(true)
		try {
			// 1. Clear Supabase Client State
			await supabase.auth.signOut()

			// 2. Clear the Server-Side Cookie
			// (Ensure this matches your filename in api/auth/...)
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
			})

			if (response.ok) {
				// 3. Force redirect and refresh to clear middleware cache
				router.push('/login')
				router.refresh()
			}
		} catch (error) {
			console.error('Logout failed:', error)
			setLoading(false)
		}
	}

	return (
		<button
			onClick={handleLogout}
			disabled={loading}
			className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full group disabled:opacity-50"
		>
			{loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />}
			<span>{loading ? 'Signing out...' : 'Logout'}</span>
		</button>
	)
}
