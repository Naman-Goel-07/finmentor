'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Shield, Bell, Save, Loader2, Info } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
	const { user, setUser } = useAuth()
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ type: '', text: '' })

	const supabase = createClient()

	const [formData, setFormData] = useState({
		full_name: '',
		email: '',
	})

	useEffect(() => {
		if (user) {
			setFormData({
				full_name: user.full_name || '',
				email: user.email || '',
			})
		}
	}, [user])

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		setSaving(true)
		setMessage({ type: '', text: '' })

		try {
			// Use .update() instead of .upsert(), and ONLY send full_name
			const { error } = await supabase
				.from('profiles')
				.update({
					full_name: formData.full_name,
					updated_at: new Date().toISOString(),
				})
				.eq('id', user.id)

			if (error) throw error

			setMessage({ type: 'success', text: 'Changes saved!' })

			// Sync the context so the Sidebar updates instantly
			setUser((prev) => (prev ? { ...prev, full_name: formData.full_name } : prev))
		} catch (error: any) {
			console.error('Supabase Error:', error.message)
			setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
		} finally {
			setSaving(false)
		}
	}

	if (!user)
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="animate-spin text-emerald-500" size={32} />
			</div>
		)

	return (
		<div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
			<header className="mb-10">
				<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight">
					Account Settings
				</h1>
				<p className="text-slate-500 mt-2 font-medium italic text-sm">Manage your identity and contact information for FinMentor AI.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				{/* Sidebar Navigation */}
				<div className="lg:col-span-3 space-y-2">
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all">
						<User size={18} /> Public Profile
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-not-allowed group">
						<Shield size={18} /> Security
						<span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1.5 py-0.5 rounded">
							Locked
						</span>
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-not-allowed group">
						<Bell size={18} /> Notifications
						<span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1.5 py-0.5 rounded">
							Locked
						</span>
					</button>
				</div>

				{/* Form Section */}
				<div className="lg:col-span-9">
					<form
						onSubmit={handleUpdate}
						className="bg-slate-900/40 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-md shadow-2xl"
					>
						<div className="p-8 space-y-8">
							{message.text && (
								<div
									className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center animate-in zoom-in duration-300 ${
										message.type === 'success'
											? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
											: 'bg-red-500/10 text-red-400 border border-red-500/20'
									}`}
								>
									{message.text}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
									<div className="relative">
										<User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
										<input
											type="text"
											required
											value={formData.full_name}
											onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
											className="w-full pl-12 pr-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium outline-none"
											placeholder="Your Name"
										/>
									</div>
								</div>

								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
										<input
											type="email"
											disabled // Locks the input field
											value={formData.email}
											className="w-full pl-12 pr-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-500 cursor-not-allowed opacity-70 transition-all font-medium outline-none"
											title="Your email is tied to your login identity and cannot be changed here."
										/>
									</div>
								</div>
							</div>

							{/* Info Box */}
							<div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex gap-3 items-start">
								<Info className="text-emerald-500 shrink-0 mt-0.5" size={16} />
								<p className="text-[11px] leading-relaxed text-slate-400 font-medium">
									Note: Your email address is linked directly to your secure authentication provider. To change your login credentials or
									email, please visit the <span className="text-emerald-400">Security</span> tab (Coming Soon).
								</p>
							</div>
						</div>

						<div className="p-6 bg-slate-950/50 border-t border-slate-800/60 flex justify-end">
							<button
								type="submit"
								disabled={saving || formData.full_name === user?.full_name}
								className="w-full md:w-auto min-h-[44px] px-10 py-2 font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 disabled:opacity-50"
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
