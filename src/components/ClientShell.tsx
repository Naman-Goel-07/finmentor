'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function ClientShell({ children }: { children: React.ReactNode }) {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [profileOpen, setProfileOpen] = useState(false) // ✅ Dropdown state

	return (
		<div className="flex h-screen w-full relative">
			<Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

			{/* Mobile overlay */}
			{sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

			<div className="flex-1 flex flex-col h-screen overflow-hidden">
				<header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
					<div className="flex items-center gap-3">
						<button
							onClick={() => setSidebarOpen(true)}
							className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
						>
							<Menu size={24} />
						</button>
						<h1 className="font-bold text-xl text-gray-800 md:hidden">FinMentor AI</h1>
					</div>

					<div className="hidden md:block text-sm text-gray-500 font-medium">Welcome back, Naman! 👋</div>

					{/* ✅ CLICKABLE AVATAR & DROPDOWN */}
					<div className="relative ml-auto">
						<button
							onClick={() => setProfileOpen(!profileOpen)}
							className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer outline-none"
						>
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ring-2 ring-gray-100 shrink-0">
								<User size={20} />
							</div>
							<ChevronDown size={16} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
						</button>

						{/* DROPDOWN MENU */}
						{profileOpen && (
							<>
								{/* Click outside to close overlay */}
								<div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />

								<div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 animate-in fade-in zoom-in duration-200">
									<div className="px-4 py-2 border-b border-gray-50">
										<p className="text-sm font-bold text-gray-900">Naman Goel</p>
										<p className="text-xs text-gray-500">Student Plan</p>
									</div>

									<Link
										href="/profile"
										className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
									>
										<User size={16} /> Profile
									</Link>

									<Link
										href="/settings"
										className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
									>
										<Settings size={16} /> Settings
									</Link>

									<div className="h-px bg-gray-100 my-1" />

									<button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
										<LogOut size={16} /> Logout
									</button>
								</div>
							</>
						)}
					</div>
				</header>

				<main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
			</div>
		</div>
	)
}
