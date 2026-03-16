'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import supabase from '@/lib/supabaseClient'

export default function ClientShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false)
	const [profile, setProfile] = useState({ name: '', avatar: '' })

	useEffect(() => {
		async function getProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (user) {
				const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()

				if (data) {
					setProfile({ name: data.full_name, avatar: data.avatar_url })
				}
			}
		}
		getProfile()
	}, [])

	return (
		<div className="flex h-screen w-full relative bg-white">
			<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				{/* Header - Fixed Height & Alignment */}
				<header className="bg-white border-b border-gray-100 h-16 flex items-center shrink-0 z-30">
					<div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 cursor-pointer p-1 hover:bg-gray-100 rounded-lg">
								<Menu size={20} />
							</button>
							<h1 className="font-bold text-xl text-gray-800 md:hidden">FinMentor</h1>
						</div>

						<div className="hidden md:block text-sm text-gray-500 font-medium">
							{profile.name ? `Welcome back, ${profile.name.split(' ')[0]}! 👋` : 'Welcome back! 👋'}
						</div>

						<div className="relative">
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-all cursor-pointer outline-none group"
							>
								<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm overflow-hidden shrink-0">
									{profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User size={20} />}
								</div>
								<ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
							</button>

							{profileOpen && (
								<>
									<div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
									<div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-150">
										<div className="px-4 py-2 border-b border-gray-50 mb-1">
											<p className="text-sm font-bold text-gray-900 truncate">{profile.name || 'FinMentor User'}</p>
										</div>
										<Link
											href="/profile"
											className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
										>
											<User size={16} /> Profile Settings
										</Link>
										<Link
											href="/profile"
											className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
										>
											<Settings size={16} /> App Settings
										</Link>
										<div className="h-px bg-gray-100 my-1" />
										<button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left">
											<LogOut size={16} /> Logout
										</button>
									</div>
								</>
							)}
						</div>
					</div>
				</header>

				{/* Scrollable Main Area */}
				<main className="flex-1 overflow-y-auto bg-gray-50/30">
					<div className="max-w-6xl mx-auto w-full p-4 md:p-8">{children}</div>
				</main>
			</div>
		</div>
	)
}
