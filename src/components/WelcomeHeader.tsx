'use client'

import { useAuth } from '@/context/AuthContext'

export default function WelcomeHeader() {
	const { user } = useAuth()
	const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there'

	return (
		<div>
			<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent leading-tight flex items-center gap-2">
				Welcome, {firstName} 👋
			</h1>
			<p className="text-slate-400 mt-2 font-medium italic">
				Here&apos;s your financial snapshot for today. Let&apos;s crush your goals together! 🚀
			</p>
		</div>
	)
}
