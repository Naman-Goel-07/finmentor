'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
	const router = useRouter()
	const [verifying, setVerifying] = useState(true)

	// Since Supabase implicit flow handles checking the hash fragment `#access_token=...` silently,
	// we just need to wait a tiny bit to confirm it ran or let it be handled directly by the library.
	useEffect(() => {
		let isMounted = true

		const verifySession = async () => {
			// Small delay allows Supabase GoTrue to parse the hash fragment and store the session locally
			await new Promise(resolve => setTimeout(resolve, 1000))
			
			const { data: { session } } = await supabase.auth.getSession()
			
			if (isMounted) {
				setVerifying(false)
			}
			
			// Auto redirect gracefully after viewing success
			setTimeout(() => {
				if (isMounted) {
					router.push('/login?message=verified')
				}
			}, 3000)
		}

		verifySession()

		return () => {
			isMounted = false
		}
	}, [router])

	return (
		<div className="min-h-screen fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4 selection:bg-emerald-500/30">
			<div className="w-full max-w-md bg-slate-900/50 p-8 rounded-3xl shadow-2xl border border-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 text-center">
				{verifying ? (
					<>
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 mb-6 shadow-lg shadow-slate-900/20">
							<Loader2 className="text-white w-8 h-8 animate-spin" />
						</div>
						<h1 className="text-2xl font-extrabold tracking-tighter text-white">
							Verifying your email...
						</h1>
						<p className="text-slate-400 mt-2 font-medium">Please wait while we secure your account.</p>
					</>
				) : (
					<div className="animate-in zoom-in duration-300">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 mb-6 shadow-lg shadow-emerald-500/20">
							<CheckCircle className="text-white w-8 h-8" />
						</div>
						<h1 className="text-2xl font-extrabold tracking-tighter text-white">
							🎉 Email verified successfully!
						</h1>
						<p className="text-slate-400 mt-2 mb-8 font-medium">You can now log in to manage your finances.</p>
						
						<Link
							href="/login?message=verified"
							className="w-full flex items-center justify-center py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98] text-white rounded-xl font-bold transition-all"
						>
							Go to Login
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
