'use client'

import { useState, useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
import { User, Mail, Shield, Bell, Save, Loader2 } from 'lucide-react'

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
				// Fetch from profiles table
				const { data, error } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

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
				// Optional: Refresh the page to update the ClientShell name
				window.location.reload()
			}
		}
		setSaving(false)
	}

	if (loading)
		return (
			<div className="flex justify-center p-20">
				<Loader2 className="animate-spin text-blue-600" />
			</div>
		)

	return (
		<div className="max-w-4xl mx-auto">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
				<p className="text-gray-500">Manage your profile information and app preferences.</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Navigation Tabs (Visual only for now) */}
				<div className="space-y-2">
					<button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg">
						<User size={18} /> Public Profile
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
						<Shield size={18} /> Security
					</button>
					<button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
						<Bell size={18} /> Notifications
					</button>
				</div>

				{/* Main Form */}
				<div className="md:col-span-2 space-y-6">
					<form onSubmit={handleUpdate} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
						<div className="p-6 space-y-4">
							{message.text && (
								<div
									className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
								>
									{message.text}
								</div>
							)}

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
								<input
									type="text"
									value={formData.full_name}
									onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
									className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
									placeholder="Enter your name"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 text-gray-400" size={18} />
									<input
										type="email"
										value={formData.email}
										disabled
										className="w-full pl-10 p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
									/>
								</div>
								<p className="mt-1 text-xs text-gray-400">Email cannot be changed manually for security.</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Currency</label>
								<select
									className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
									value={formData.currency}
									onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
								>
									<option value="INR">INR (₹) - Indian Rupee</option>
									<option value="USD">USD ($) - US Dollar</option>
								</select>
							</div>
						</div>

						<div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
							<button
								type="submit"
								disabled={saving}
								className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
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
