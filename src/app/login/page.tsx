'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
	const router = useRouter()
	const supabase = createClient()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [showForgotModal, setShowForgotModal] = useState(false)

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (authError) {
				if (authError.message.includes('Email not confirmed')) {
					throw new Error('Please verify your email before logging in.')
				}
				throw authError
			}

			router.push('/dashboard')
			router.refresh()
		} catch (err: any) {
			setError(err.message || 'Failed to login')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4 selection:bg-blue-500/30">
			<div className="w-full max-w-md bg-slate-900/50 p-8 rounded-3xl shadow-2xl border border-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-6 shadow-lg shadow-blue-500/20">
						<Lock className="text-white w-8 h-8" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
						Welcome Back
					</h1>
					<p className="text-slate-400 mt-2 font-medium">Log in to manage your finances.</p>
				</div>

				<Suspense fallback={<div className="h-20" />}>
					<LoginMessages />
				</Suspense>

				{error && (
					<div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
						<p className="text-sm font-medium text-red-200">{error}</p>
					</div>
				)}

				<form onSubmit={handleLogin} className="space-y-5">
					{/* Email Section */}
					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
						{/* ... email input ... */}
					</div>
					{/* Password Section */}
					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
						<div className="relative">
							{/* ... lock icon ... */}
							<input
								type={showPassword ? 'text' : 'password'}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="block w-full pl-11 pr-12 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500"
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>

						{/* Pair the Forgot Password link tightly with the password field */}
						<div className="flex justify-end mt-2">
							<button
								type="button"
								onClick={() => setShowForgotModal(true)}
								className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
							>
								Forgot Password?
							</button>
						</div>
					</div>{' '}
					{/* This div closes the entire Password + Forgot Link group */}
					<button
						type="submit"
						disabled={loading}
						className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 ... mt-4"
					>
						{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
						{!loading && <ArrowRight className="w-5 h-5" />}
					</button>
				</form>

				<p className="mt-8 text-center text-sm text-slate-400 font-medium">
					Don&apos;t have an account?{' '}
					<Link href="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-bold">
						Sign up here
					</Link>
				</p>
			</div>

			{/* Forgot Password Modal (Smoke & Mirrors) */}
			{showForgotModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
					<div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
						<div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
							<Shield className="text-blue-400" size={32} />
						</div>

						<h3 className="text-xl font-bold text-white mb-4">Password Reset</h3>

						<p className="text-slate-400 text-sm leading-relaxed mb-8">
							For security purposes during the **FinMentor AI Beta**, please contact
							<span className="text-blue-400 font-bold ml-1">letyuvstudy@gmail.com</span> to manually reset your password, or simply create a new
							account.
						</p>

						<button
							onClick={() => setShowForgotModal(false)}
							className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95"
						>
							Got it, thanks!
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

function LoginMessages() {
	const searchParams = useSearchParams()
	const msg = searchParams.get('message')

	if (msg === 'verify-email') {
		return (
			<div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
				<AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
				<p className="text-sm font-medium text-amber-200">✅ Confirmation email sent. Check your inbox to verify before logging in.</p>
			</div>
		)
	}

	if (msg === 'verified') {
		return (
			<div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
				<CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
				<p className="text-sm font-medium text-emerald-200">🎉 Email verified! You can now log in.</p>
			</div>
		)
	}

	return null
}
