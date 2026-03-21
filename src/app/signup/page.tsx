'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client' // Ensure this is the SSR version

export default function SignupPage() {
	const router = useRouter()
	const supabase = createClient()
	const [fullName, setFullName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isEmailSent, setIsEmailSent] = useState(false)

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			// 1. Sign up with Supabase
			// The SSR client handles the session cookies automatically if auto-login is enabled
			const { data, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
					},
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			})

			if (authError) throw authError

			// 2. Determine next step
			if (data.session) {
				// If email confirmation is OFF in Supabase settings
				router.push('/dashboard')
				router.refresh()
			} else {
				// If email confirmation is ON (Standard)
				setIsEmailSent(true)
			}
		} catch (err: any) {
			setError(err.message || 'Failed to sign up')
		} finally {
			setLoading(false)
		}
	}

	if (isEmailSent) {
		return (
			<div className="min-h-screen fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-slate-900/50 p-8 rounded-3xl shadow-2xl border border-slate-800/60 backdrop-blur-xl text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 mb-6 shadow-lg shadow-emerald-500/20">
						<Mail className="text-white w-8 h-8" />
					</div>
					<h1 className="text-2xl font-extrabold tracking-tighter text-white mb-2">Check your email</h1>
					<p className="text-slate-400 font-medium mb-8">
						We sent a link to <span className="text-emerald-400 font-bold">{email}</span>. Please verify your account to continue.
					</p>
					<Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold">
						Back to Login
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4 selection:bg-emerald-500/30">
			<div className="w-full max-w-md bg-slate-900/50 p-8 rounded-3xl shadow-2xl border border-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 mb-6 shadow-lg shadow-emerald-500/20">
						<User className="text-white w-8 h-8" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
						Create Account
					</h1>
					<p className="text-slate-400 mt-2 font-medium">Join FinMentor AI today.</p>
				</div>

				{error && (
					<div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
						<p className="text-sm font-medium text-red-200">{error}</p>
					</div>
				)}

				<form onSubmit={handleSignup} className="space-y-5">
					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<User className="h-5 w-5 text-slate-500" />
							</div>
							<input
								type="text"
								required
								value={fullName}
								onChange={(e) => setFullName(e.target.value)}
								className="block w-full pl-11 pr-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
								placeholder="Username"
							/>
						</div>
					</div>

					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<Mail className="h-5 w-5 text-slate-500" />
							</div>
							<input
								type="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="block w-full pl-11 pr-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
								placeholder="you@example.com"
							/>
						</div>
					</div>

					<div>
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<Lock className="h-5 w-5 text-slate-500" />
							</div>
							<input
								type="password"
								required
								minLength={6}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="block w-full pl-11 pr-4 py-3 border border-slate-700 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
								placeholder="••••••••"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] text-white rounded-xl font-bold transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
						{!loading && <ArrowRight className="w-5 h-5" />}
					</button>
				</form>

				<p className="mt-8 text-center text-sm text-slate-400 font-medium">
					Already have an account?{' '}
					<Link href="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-bold">
						Sign in here
					</Link>
				</p>
			</div>
		</div>
	)
}
