'use client'

import { useState } from 'react'
import supabase from '@/lib/supabaseClient'
import { User, Mail, Shield, Bell, Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
	const { user, setUser } = useAuth()
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ type: '', text: '' })

	const [formData, setFormData] = useState({
		full_name: user?.full_name || '',
		email: user?.email || '',
	})

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return
		setSaving(true)
		setMessage({ type: '', text: '' })

		const { error } = await supabase.from('profiles').upsert({
			id: user.id,
			full_name: formData.full_name,
			email: formData.email,
		})

		if (error) {
			console.error('Supabase Error:', error.message)
			setMessage({ type: 'error', text: 'Failed to update profile.' })
		} else {
			setMessage({ type: 'success', text: 'Changes saved!' })
			setUser((prev) => (prev ? { ...prev, full_name: formData.full_name, email: formData.email } : prev))
		}
		setSaving(false)
	}

	if (!user) return null

	return (
		<div className="max-w-5xl mx-auto animate-in fade-in duration-500">
			<header className="mb-10">
				<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent leading-tight">
					Account Settings
				</h1>
				<p className="text-slate-500 mt-2 font-medium italic text-sm">Manage your identity and contact information.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				<div className="lg:col-span-3 space-y-2">
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl transition-all">
						<User size={18} /> Public Profile
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-not-allowed">
						<Shield size={18} /> Security
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-not-allowed">
						<Bell size={18} /> Notifications
					</button>
				</div>

				<div className="lg:col-span-9">
					<form onSubmit={handleUpdate} className="bg-slate-900/40 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-md">
						<div className="p-8 space-y-8">
							{message.text && (
								<div
									className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
								>
									{message.text}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
									<input
										type="text"
										value={formData.full_name}
										onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
										className="w-full px-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 transition-all font-medium outline-none"
										placeholder="Your Name"
									/>
								</div>

								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
										<input
											type="email"
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="w-full pl-12 pr-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 transition-all font-medium outline-none"
											placeholder="demo@example.com"
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="p-6 bg-slate-950/50 border-t border-slate-800/60 flex justify-end">
							<button
								type="submit"
								disabled={saving}
								className="w-full md:w-auto min-h-[44px] px-10 py-2 font-bold text-slate-900 bg-gray-100 hover:bg-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
							>
								{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
								Save Changes
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
