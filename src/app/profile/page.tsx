'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
import { User, Mail, Shield, Bell, Save, Loader2, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ type: '', text: '' })
	const router = useRouter()

	const [formData, setFormData] = useState({
		full_name: '',
		email: '',
		currency: 'INR',
	})

	useEffect(() => {
		async function fetchProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (user) {
				const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
				setFormData({
					full_name: data?.full_name || '',
					email: user.email || '',
					currency: 'INR',
				})
			}
			setLoading(false)
		}
		fetchProfile()
	}, [])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setMessage({ type: '', text: '' })

		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (user) {
			const { error } = await supabase.from('profiles').upsert({
				id: user.id,
				full_name: formData.full_name,
				updated_at: new Date().toISOString(),
			})

			if (error) {
				setMessage({ type: 'error', text: 'Failed to update profile.' })
			} else {
				setMessage({ type: 'success', text: 'Changes saved! Realtime sync active. ✨' })
				// router.refresh() // Optional: syncs server-side components
			}
		}
		setSaving(false)
	}

	if (loading)
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center">
				<Loader2 className="animate-spin text-blue-500" size={40} />
			</div>
		)

	return (
		<div className="max-w-5xl mx-auto animate-in fade-in duration-500">
			<header className="mb-10">
				<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-slate-200 to-slate-500 bg-clip-text text-transparent">
					Account Settings
				</h1>
				<p className="text-slate-500 mt-2 font-medium italic text-sm">Manage your identity and preferences.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				{/* 🧭 Nav Sidebar */}
				<div className="lg:col-span-3 space-y-2">
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl transition-all">
						<User size={18} /> Public Profile
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all">
						<Shield size={18} /> Security
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all">
						<Bell size={18} /> Notifications
					</button>
				</div>

				{/* 📝 Form Section */}
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
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email (Primary)</label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
										<input
											type="email"
											value={formData.email}
											disabled
											className="w-full pl-12 pr-5 py-3.5 bg-slate-900/50 border border-slate-800/50 rounded-2xl text-slate-500 cursor-not-allowed font-medium"
										/>
									</div>
								</div>

								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Preferred Currency</label>
									<div className="relative">
										<Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
										<select
											value={formData.currency}
											onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
											className="w-full pl-12 pr-5 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white appearance-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium outline-none"
										>
											<option value="INR">INR (₹) - India</option>
											<option value="USD">USD ($) - USA</option>
										</select>
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
