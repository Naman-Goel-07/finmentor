'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import supabase from '@/lib/supabaseClient'

// ✅ Match the ID you used in the SQL and Profile Page
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'

export default function ClientShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [profile, setProfile] = useState({ name: '', avatar: '' })

	useEffect(() => {
		let channel: any

		async function getProfile() {
			// 1. Fetch the profile directly using the Demo ID (no auth check needed)
			const { data: profileData, error } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', DEMO_USER_ID).single()

			if (profileData) {
				setProfile({
					name: profileData.full_name || '',
					avatar: profileData.avatar_url || '',
				})
			}

			// 2. ✅ REALTIME: Still works! Listen for changes to the Demo ID
			channel = supabase
				.channel(`profile-demo`)
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'profiles',
						filter: `id=eq.${DEMO_USER_ID}`,
					},
					(payload) => {
						if (payload?.new) {
							setProfile({
								name: payload.new.full_name || '',
								avatar: payload.new.avatar_url || '',
							})
						}
					},
				)
				.subscribe()
		}

		getProfile()

		return () => {
			if (channel) {
				supabase.removeChannel(channel)
			}
		}
	}, [])

	return (
		<div className="flex h-screen w-full relative bg-[#020617] text-slate-200 selection:bg-blue-500/30">
			<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userProfile={profile} />

			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				{/* HEADER */}
				<header className="bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/60 h-16 flex items-center shrink-0 z-30">
					<div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSidebarOpen(true)}
								className="md:hidden text-slate-400 cursor-pointer p-2 hover:bg-slate-800 rounded-xl transition-all"
							>
								<Menu size={20} />
							</button>
							<h1 className="font-bold text-xl text-white md:hidden tracking-tight">FinMentor</h1>
						</div>

						<div className="hidden md:block text-sm text-slate-400 font-medium italic">
							{profile.name ? `Welcome back, ${profile.name.split(' ')[0]}! 👋` : 'Welcome back! 👋'}
						</div>

						<div className="relative">
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-all cursor-pointer outline-none group"
							>
								<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white border-2 border-slate-800 shadow-lg overflow-hidden shrink-0">
									{profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={20} />}
								</div>
								<ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
							</button>

							{profileOpen && (
								<>
									<div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
									<div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-1.5 z-20 animate-in fade-in zoom-in duration-200">
										<div className="px-3 py-2 border-b border-slate-800 mb-1">
											<p className="text-sm font-bold text-white truncate">{profile.name || 'Demo User'}</p>
										</div>
										<Link
											href="/profile"
											className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
											onClick={() => setProfileOpen(false)}
										>
											<User size={16} /> Profile Settings
										</Link>
										<div className="h-px bg-slate-800 my-1 mx-2" />
										<Link
											href="/"
											className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer text-left font-medium"
										>
											<LogOut size={16} /> Reset Demo
										</Link>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				<main className="flex-1 overflow-y-auto bg-[#020617]">
					<div className="max-w-6xl mx-auto w-full p-4 md:p-8 min-h-full">{children}</div>
				</main>
			</div>
		</div>
	)
}
