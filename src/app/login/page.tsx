'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import supabase from '@/lib/supabaseClient'

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			// 1. Authenticate with Supabase Client
			const { data, error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (authError) throw authError

			// 2. Set the secure HTTP-only cookie for Next.js Middleware/SSR
			if (data.session?.access_token) {
				const res = await fetch('/api/auth/set-session', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						access_token: data.session.access_token,
						refresh_token: data.session.refresh_token,
					}),
				})

				if (!res.ok) {
					throw new Error('Failed to set secure session cookie.')
				}
			}

			// 3. Redirect to Dashboard
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

				{error && (
					<div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
						<p className="text-sm font-medium text-red-200">{error}</p>
					</div>
				)}

				<form onSubmit={handleLogin} className="space-y-5">
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
						className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] text-white rounded-xl font-bold transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
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
		</div>
	)
}
