'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Shield, Bell, Save, Loader2, Info, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ProfilePage() {
	const { user, setUser } = useAuth()

	// UI State
	const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

	// Profile Form State
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ type: '', text: '' })
	const [formData, setFormData] = useState({
		full_name: '',
		email: '',
	})

	// Security Form State
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordSaving, setPasswordSaving] = useState(false)
	const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })

	// Visibility Toggles
	const [showCurrent, setShowCurrent] = useState(false)
	const [showNew, setShowNew] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)

	const supabase = createClient()

	useEffect(() => {
		if (user) {
			setFormData({
				full_name: user.full_name || '',
				email: user.email || '',
			})
		}
	}, [user])

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		setSaving(true)
		setMessage({ type: '', text: '' })

		try {
			const { error } = await supabase
				.from('profiles')
				.update({
					full_name: formData.full_name,
					updated_at: new Date().toISOString(),
				})
				.eq('id', user.id)

			if (error) throw error

			setMessage({ type: 'success', text: 'Changes saved!' })
			setUser((prev) => (prev ? { ...prev, full_name: formData.full_name } : prev))
		} catch (error: any) {
			setMessage({ type: 'error', text: 'Failed to update profile.' })
		} finally {
			setSaving(false)
		}
	}

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault()

		if (newPassword !== confirmPassword) {
			setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
			return
		}

		setPasswordSaving(true)
		setPasswordMessage({ type: '', text: '' })

		try {
			const response = await fetch('/api/auth/update-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword }),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to update password')
			}

			setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
		} catch (error: any) {
			setPasswordMessage({ type: 'error', text: error.message || 'Failed to update password.' })
		} finally {
			setPasswordSaving(false)
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
					{[
						{ id: 'profile', label: 'Profile Details', icon: User },
						{ id: 'security', label: 'Security', icon: Shield },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as any)}
							className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
								activeTab === tab.id
									? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
									: 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent'
							}`}
						>
							<tab.icon size={18} /> {tab.label}
						</button>
					))}
					<button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-300 transition-all cursor-not-allowed group border border-transparent">
						<Bell size={18} /> Notifications
						<span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-1.5 py-0.5 rounded">
							Locked
						</span>
					</button>
				</div>

				{/* Form Section */}
				<div className="lg:col-span-9">
					{activeTab === 'profile' && (
						<form
							onSubmit={handleUpdateProfile}
							className="bg-slate-900/40 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-300"
						>
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
										<div className="relative">
											<User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
											<input
												type="text"
												required
												value={formData.full_name}
												onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
												className="w-full pl-12 pr-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium outline-none"
											/>
										</div>
									</div>
									<div className="space-y-3">
										<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
										<div className="relative">
											<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
											<input
												disabled
												value={formData.email}
												className="w-full pl-12 pr-5 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-slate-500 cursor-not-allowed opacity-70 font-medium outline-none"
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="p-6 bg-slate-950/50 border-t border-slate-800/60 flex justify-end">
								<button
									type="submit"
									disabled={saving || formData.full_name === user?.full_name}
									className="w-full md:w-auto px-10 py-2 font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
								>
									{saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Profile
								</button>
							</div>
						</form>
					)}

					{activeTab === 'security' && (
						<form
							onSubmit={handleUpdatePassword}
							className="bg-slate-900/40 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-300"
						>
							<div className="p-8 space-y-8">
								<div className="space-y-2">
									<h2 className="text-xl font-bold text-white flex items-center gap-2">
										<Lock className="text-emerald-400" size={20} /> Authentication
									</h2>
									<p className="text-sm text-slate-400">Confirm your identity and set a new password.</p>
								</div>

								{passwordMessage.text && (
									<div
										className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center ${passwordMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
									>
										{passwordMessage.text}
									</div>
								)}

								<div className="max-w-md space-y-6">
									{/* Current Password Field */}
									<div className="space-y-3">
										<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Current Password</label>
										<div className="relative">
											<Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
											<input
												type={showCurrent ? 'text' : 'password'}
												required
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												className="w-full pl-12 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
												placeholder="Required to verify identity"
											/>
											<button
												type="button"
												onClick={() => setShowCurrent(!showCurrent)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400 transition-colors"
											>
												{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</div>

									{/* New Password Field */}
									<div className="space-y-3 pt-4 border-t border-slate-800/40">
										<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
										<div className="relative">
											<KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
											<input
												type={showNew ? 'text' : 'password'}
												required
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className="w-full pl-12 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
											/>
											<button
												type="button"
												onClick={() => setShowNew(!showNew)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400"
											>
												{showNew ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</div>

									<div className="space-y-3">
										<label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
										<div className="relative">
											<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
											<input
												type={showConfirm ? 'text' : 'password'}
												required
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className="w-full pl-12 pr-12 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-emerald-500/50 outline-none"
											/>
											<button
												type="button"
												onClick={() => setShowConfirm(!showConfirm)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-400"
											>
												{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</div>
								</div>
								<div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex gap-3 items-start">
									<Info className="text-emerald-500 shrink-0 mt-0.5" size={16} />
									<p className="text-[11px] leading-relaxed text-slate-400 font-medium">
										Re-entering your current password adds an extra layer of security before critical account changes.
									</p>
								</div>
							</div>
							<div className="p-6 bg-slate-950/50 border-t border-slate-800/60 flex justify-end">
								<button
									type="submit"
									disabled={passwordSaving || !newPassword || !currentPassword}
									className="w-full md:w-auto px-10 py-2 font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center gap-2"
								>
									{passwordSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Update Password
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	)
}
