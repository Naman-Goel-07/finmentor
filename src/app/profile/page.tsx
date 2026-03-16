'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
import { User, Mail, Shield, Bell, Save, Loader2, CreditCard } from 'lucide-react'

export default function ProfilePage() {
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ type: '', text: '' })

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
				setMessage({ type: 'success', text: 'Profile updated successfully!' })
				setTimeout(() => window.location.reload(), 1000)
			}
		}
		setSaving(false)
	}

	if (loading)
		return (
			<div className="flex justify-center p-20">
				<Loader2 className="animate-spin text-blue-600" size={32} />
			</div>
		)

	return (
		<div className="max-w-5xl mx-auto w-full">
			{/* ✅ GRADIENT HEADING */}
			<header className="mb-8">
				<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
					Account Settings
				</h1>
				<p className="text-gray-500 mt-1 font-medium">Manage your profile information and app preferences.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Navigation Sidebar */}
				<div className="lg:col-span-3 space-y-2">
					<nav className="flex flex-col gap-1">
						<button className="flex items-center gap-3 px-4 py-3 text-sm font-bold bg-slate-900 text-white rounded-xl shadow-md transition-all">
							<User size={18} /> Public Profile
						</button>
						<button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
							<Shield size={18} /> Security
						</button>
						<button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
							<Bell size={18} /> Notifications
						</button>
					</nav>
				</div>

				{/* Main Form Section */}
				<div className="lg:col-span-9">
					<form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
						<div className="p-8 space-y-6">
							{message.text && (
								<div
									className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
								>
									{message.text}
								</div>
							)}

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* ✅ BLACK INPUT: Full Name */}
								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
									<input
										type="text"
										value={formData.full_name}
										onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
										className="w-full px-4 py-3 bg-slate-900 border-none rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
										placeholder="Enter your name"
									/>
								</div>

								{/* ✅ DARK INPUT: Email (Disabled) */}
								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
									<div className="relative">
										<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
										<input
											type="email"
											value={formData.email}
											disabled
											className="w-full pl-12 pr-4 py-3 bg-slate-800 border-none rounded-xl text-slate-400 cursor-not-allowed font-medium opacity-70"
										/>
									</div>
								</div>

								{/* ✅ BLACK SELECT: Currency */}
								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Currency</label>
									<select
										value={formData.currency}
										onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
										className="w-full px-4 py-3 bg-slate-900 border-none rounded-xl text-white appearance-none focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
									>
										<option value="INR">INR (₹) - Indian Rupee</option>
										<option value="USD">USD ($) - US Dollar</option>
									</select>
								</div>
							</div>
						</div>

						{/* Footer / Save Button */}
						<div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
							<button
								type="submit"
								disabled={saving}
								className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg active:scale-95 cursor-pointer"
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
