'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Activity, Clock, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Consulting the wealth spirits...',
	'Preparing your financial roast...',
	'Analyzing patterns... stay calm.',
]

const DAILY_LIMIT = 10

export default function AICoachPage() {
	const supabase = createClient()

	// State Guards
	const [isReady, setIsReady] = useState(false)
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)

	// UI States
	const [loading, setLoading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)
	const [monthlyBudget, setMonthlyBudget] = useState('10000')
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

	// Usage States
	const [usageCount, setUsageCount] = useState(0)
	const [nextResetTime, setNextResetTime] = useState<string | null>(null)
	const [countdown, setCountdown] = useState<string>('')

	// REVALIDATION HELPER: Forces a fresh pull from the database
	const syncUsageFromDB = async (userId: string) => {
		try {
			const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
			const { data, count } = await supabase
				.from('ai_logs')
				.select('created_at', { count: 'exact' })
				.eq('user_id', userId)
				.eq('status_code', 200)
				.gt('created_at', last24h)
				.order('created_at', { ascending: true })

			const freshCount = count || 0
			setUsageCount(freshCount)
			setNextResetTime(data && data.length > 0 ? data[0].created_at : null)
			return freshCount
		} catch (err) {
			console.error('DB Sync failed:', err)
			return 0
		}
	}

	// 1. ONE-TIME INIT (Instant Local Hydration)
	useEffect(() => {
		let isMounted = true

		const initializeSession = async () => {
			try {
				// INSTANT CHECK: Read local session first (no network delay)
				const {
					data: { session },
				} = await supabase.auth.getSession()
				let user = session?.user

				// FALLBACK: If local session is missing, try network
				if (!user) {
					const { data } = await supabase.auth.getUser()
					user = data?.user
				}

				if (user && isMounted) {
					setCurrentUserId(user.id)

					// 1. Pull active report from temporary session cache instantly
					const cachedAdvice = sessionStorage.getItem(`finmentor_advice_${user.id}`)
					const cachedBudget = sessionStorage.getItem(`finmentor_budget_${user.id}`)
					const cachedCount = sessionStorage.getItem(`finmentor_count_${user.id}`)

					if (cachedAdvice) setAdvice(cachedAdvice)
					if (cachedBudget) setMonthlyBudget(cachedBudget)
					if (cachedCount) setExpenseCount(parseInt(cachedCount))

					// 2. Fetch fresh usage count from DB (DO NOT AWAIT - let UI render immediately)
					syncUsageFromDB(user.id)
				}
			} catch (e) {
				console.error('Initialization failed:', e)
			} finally {
				// Unlock UI instantly, regardless of network speed
				if (isMounted) setIsReady(true)
			}
		}

		initializeSession()

		return () => {
			isMounted = false
		}
	}, [supabase])

	// 2. ANALYZE (With Explicit Cache Revalidation)
	const handleAnalyze = async () => {
		if (!currentUserId) return
		setLoading(true)
		setError(null)

		try {
			const [expensesRes, goalsRes] = await Promise.all([
				supabase.from('expenses').select('*').eq('user_id', currentUserId).order('date', { ascending: false }).limit(20),
				supabase.from('goals').select('id, goal_name, target_amount, deadline').eq('user_id', currentUserId).eq('is_archived', false),
			])

			if (expensesRes.error) throw new Error(expensesRes.error.message)
			const currentCount = expensesRes.data?.length || 0

			const response = await fetch('/api/ai-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					income: Number(monthlyBudget),
					expenses: expensesRes.data,
					goals: goalsRes.data,
				}),
			})

			const data = await response.json()
			if (!response.ok && data.error !== 'DAILY_LIMIT_REACHED') throw new Error(data.details || data.error)

			// Update UI
			setAdvice(data.advice)
			setExpenseCount(currentCount)

			// Update Session Cache completely
			sessionStorage.setItem(`finmentor_advice_${currentUserId}`, data.advice)
			sessionStorage.setItem(`finmentor_budget_${currentUserId}`, monthlyBudget)
			sessionStorage.setItem(`finmentor_count_${currentUserId}`, currentCount.toString())

			// EXPLICIT REVALIDATION: Pull exact usage from DB
			await syncUsageFromDB(currentUserId)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	// Wipes UI and Cache
	const clearActiveAudit = () => {
		setAdvice(null)
		if (currentUserId) {
			sessionStorage.removeItem(`finmentor_advice_${currentUserId}`)
			sessionStorage.removeItem(`finmentor_budget_${currentUserId}`)
			sessionStorage.removeItem(`finmentor_count_${currentUserId}`)
		}
	}

	// Countdown Timer logic
	useEffect(() => {
		if (!nextResetTime || usageCount < DAILY_LIMIT) {
			setCountdown('')
			return
		}

		const timer = setInterval(() => {
			const resetDate = new Date(nextResetTime)
			resetDate.setHours(resetDate.getHours() + 24)
			const diff = resetDate.getTime() - new Date().getTime()

			if (diff <= 0) {
				setCountdown('')
				if (currentUserId) syncUsageFromDB(currentUserId)
				clearInterval(timer)
			} else {
				const hours = Math.floor(diff / 3600000)
				const minutes = Math.floor((diff % 3600000) / 60000)
				const seconds = Math.floor((diff % 60000) / 1000)
				setCountdown(`${hours}h ${minutes}m ${seconds}s`)
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [nextResetTime, usageCount, currentUserId])

	// Cycler for loading messages
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (loading) {
			interval = setInterval(() => {
				setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
			}, 3000)
		}
		return () => clearInterval(interval)
	}, [loading])

	if (!isReady) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
				<p className="text-slate-400 font-medium animate-pulse text-xs uppercase tracking-widest">Initializing Protocol...</p>
			</div>
		)
	}

	return (
		<div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent leading-none pb-2">
						AI Coach
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic text-sm">Personalized financial intervention by Gemini.</p>
				</div>

				<div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-sm min-w-[220px]">
					<div className="flex justify-between items-center mb-2">
						<span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
							<Activity size={12} className="text-purple-400" /> Daily Limit
						</span>
						<span className="text-xs font-bold text-white flex items-center gap-2">
							{usageCount}/{DAILY_LIMIT}
						</span>
					</div>
					<div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
						<div
							className={`h-full transition-all duration-1000 ${usageCount >= DAILY_LIMIT ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}
							style={{ width: `${Math.min((usageCount / DAILY_LIMIT) * 100, 100)}%` }}
						/>
					</div>
					{countdown && (
						<div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold animate-pulse">
							<Clock size={10} /> Next slot in: {countdown}
						</div>
					)}
				</div>
			</header>

			{!advice && !loading && (
				<section className="bg-slate-900/50 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-16 text-center backdrop-blur-sm relative group transition-all duration-500 hover:border-slate-600/80">
					<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
					<Zap className="text-purple-400 mx-auto mb-6 transition-transform group-hover:scale-110" size={48} />
					<h2 className="text-3xl font-extrabold text-white mb-6">Ready for an intervention? 🚀</h2>
					<div className="mb-8 max-w-xs mx-auto">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							disabled={usageCount >= DAILY_LIMIT || !isReady}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-center font-bold text-white text-xl focus:border-purple-500 transition-all disabled:opacity-30"
						/>
					</div>
					<button
						onClick={handleAnalyze}
						disabled={usageCount >= DAILY_LIMIT || !isReady}
						className="px-8 py-4 font-bold text-white bg-slate-900 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all flex items-center justify-center mx-auto gap-2 active:scale-95 disabled:opacity-30"
					>
						{usageCount >= DAILY_LIMIT ? `Locked: ${countdown}` : 'Analyze My Finances'}
						<ChevronRight size={20} />
					</button>
				</section>
			)}

			{loading && (
				<div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/60 backdrop-blur-sm">
					<Loader2 className="animate-spin text-purple-400 mb-4" size={64} />
					<p className="text-xl font-bold text-white mb-2">{LOADING_MESSAGES[loadingMsgIndex]}</p>
				</div>
			)}

			{advice && !loading && (
				<div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
					<div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
							<RotateCcw size={14} className="text-purple-400" /> Active Audit Record
						</p>
						<button
							onClick={handleAnalyze}
							disabled={usageCount >= DAILY_LIMIT || !isReady}
							className="text-xs font-black text-purple-400 hover:text-purple-300 transition-colors uppercase disabled:opacity-30"
						>
							Run New Audit →
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ label: 'Items Scanned', value: expenseCount, icon: TrendingDown, color: 'text-blue-400', bg: 'bg-blue-500/10' },
							{
								label: 'Budget Limit',
								value: `₹${Number(monthlyBudget).toLocaleString('en-IN')}`,
								icon: Target,
								color: 'text-amber-400',
								bg: 'bg-amber-500/10',
							},
							{ label: 'Audit Status', value: 'Complete', icon: Sparkles, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
						].map((stat, i) => (
							<div
								key={i}
								className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 flex items-start justify-between backdrop-blur-sm group hover:border-slate-700 transition-all duration-300"
							>
								<div>
									<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
									<h3 className={`text-3xl font-bold ${stat.label === 'Audit Status' ? 'text-emerald-400 italic' : 'text-white'}`}>
										{stat.value}
									</h3>
								</div>
								<div
									className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110`}
								>
									<stat.icon size={24} />
								</div>
							</div>
						))}
					</div>

					<div className="bg-[#0f172a] rounded-3xl border border-slate-800/60 p-8 md:p-12 shadow-2xl relative overflow-hidden">
						<div className="prose prose-invert max-w-none text-slate-300">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => (
										<h1 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4 text-white uppercase tracking-tight" {...props} />
									),
									h2: ({ ...props }) => (
										<h2 className="text-xl font-bold mt-8 mb-4 text-white border-l-4 border-purple-500 pl-3" {...props} />
									),
									li: ({ children }) => (
										<div className="p-4 px-6 mb-2 flex items-start gap-3 bg-slate-800/30 rounded-2xl border border-slate-700/40 group hover:bg-slate-800/50 transition-all">
											<ChevronRight size={18} className="mt-1 text-purple-400 shrink-0" />
											<span className="text-slate-100 font-bold">{children}</span>
										</div>
									),
									strong: ({ ...props }) => <strong className="font-extrabold text-white bg-purple-500/20 px-1 rounded" {...props} />,
									blockquote: ({ ...props }) => (
										<div className="bg-slate-950/60 text-slate-300 p-6 my-6 italic rounded-2xl border-l-8 border-purple-500" {...props} />
									),
								}}
							>
								{advice}
							</ReactMarkdown>
						</div>
						<div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
							<button onClick={clearActiveAudit} className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors">
								Clear This Report
							</button>
							<span className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">AI Protocol V2.5 Active</span>
						</div>
					</div>
				</div>
			)}

			{error && (
				<div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 flex items-center gap-4 animate-in zoom-in">
					<AlertCircle size={24} className="shrink-0" />
					<p className="text-xs font-bold">{error}</p>
				</div>
			)}
		</div>
	)
}
