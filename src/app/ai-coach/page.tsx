'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Activity, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Calculating SIP opportunities...',
	'Consulting the wealth spirits...',
	'Auditing your spending habits...',
	'Checking goal deadlines...',
	'Preparing your financial roast...',
	'Analyzing patterns... stay calm.',
]

const DAILY_LIMIT = 10

export default function AICoachPage() {
	const [loading, setLoading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)
	const [monthlyBudget, setMonthlyBudget] = useState('10000')
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

	// Meter & Timer States
	const [usageCount, setUsageCount] = useState(0)
	const [nextResetTime, setNextResetTime] = useState<string | null>(null)
	const [countdown, setCountdown] = useState<string>('')

	const supabase = createClient()

	// 1. Fetch usage and the timestamp of the oldest roast in the rolling 24h stack
	const fetchUsage = useCallback(async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) return

			const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

			const {
				data,
				count,
				error: countError,
			} = await supabase
				.from('ai_logs')
				.select('created_at', { count: 'exact' })
				.eq('user_id', user.id)
				.eq('status_code', 200)
				.gt('created_at', last24h)
				.order('created_at', { ascending: true }) // Get oldest roast first

			if (!countError) {
				setUsageCount(count || 0)
				// nextResetTime is 24h after the OLDEST roast in the current last-24h window
				if (data && data.length > 0) {
					setNextResetTime(data[0].created_at)
				} else {
					setNextResetTime(null)
				}
			}
		} catch (err) {
			console.error('Usage fetch failed:', err)
		}
	}, [supabase])

	// 2. Countdown Timer Logic
	useEffect(() => {
		// We only need a countdown if they are AT or OVER the limit
		if (!nextResetTime || usageCount < DAILY_LIMIT) {
			setCountdown('')
			return
		}

		const timer = setInterval(() => {
			const resetDate = new Date(nextResetTime)
			resetDate.setHours(resetDate.getHours() + 24)

			const now = new Date()
			const diff = resetDate.getTime() - now.getTime()

			if (diff <= 0) {
				setCountdown('')
				fetchUsage() // Auto-refresh UI when a slot opens up
				clearInterval(timer)
			} else {
				const hours = Math.floor(diff / (1000 * 60 * 60))
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
				const seconds = Math.floor((diff % (1000 * 60)) / 1000)
				setCountdown(`${hours}h ${minutes}m ${seconds}s`)
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [nextResetTime, usageCount, fetchUsage])

	useEffect(() => {
		fetchUsage()
	}, [fetchUsage])

	// Cycle Loading Messages
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (loading) {
			interval = setInterval(() => {
				setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
			}, 3000)
		}
		return () => clearInterval(interval)
	}, [loading])

	const handleAnalyze = async () => {
		setLoading(true)
		setError(null)
		setAdvice(null)

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('Unauthorized: Please log in.')

			const [expensesRes, goalsRes] = await Promise.all([
				supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
				supabase.from('goals').select('id, goal_name, target_amount, deadline').eq('user_id', user.id).eq('is_archived', false),
			])

			if (expensesRes.error) throw new Error(`DB Error: ${expensesRes.error.message}`)
			setExpenseCount(expensesRes.data?.length || 0)

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

			if (!response.ok) {
				if (data.error === 'DAILY_LIMIT_REACHED') {
					setAdvice(data.advice)
					fetchUsage() // Refresh reset time immediately
					return
				}
				throw new Error(data.details || data.error || 'AI Coach failed to respond.')
			}

			setAdvice(data.advice)
			fetchUsage() // Update meter after success
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
						AI Coach
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic text-sm">Personalized financial intervention by Gemini.</p>
				</div>

				{/* USAGE METER UI */}
				<div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl backdrop-blur-sm min-w-[220px]">
					<div className="flex justify-between items-center mb-2">
						<span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
							<Activity size={12} className="text-purple-400" /> Daily Limit
						</span>
						<span className="text-xs font-bold text-white">
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

					<div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
						<Zap className="text-purple-400 fill-purple-500/10" size={32} />
					</div>

					<h2 className="text-3xl font-extrabold text-white mb-6 z-10 relative">
						{usageCount >= DAILY_LIMIT ? 'Coach is Resting 😴' : 'Stop Guessing, Start Growing 🚀'}
					</h2>

					<div className="mb-8 max-w-xs mx-auto z-10 relative">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							disabled={usageCount >= DAILY_LIMIT}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-center font-bold text-white text-xl focus:border-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
						/>
					</div>

					<button
						onClick={handleAnalyze}
						disabled={usageCount >= DAILY_LIMIT}
						className="px-8 py-4 font-bold text-white bg-slate-900 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all flex items-center justify-center mx-auto gap-2 z-10 relative active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
					>
						{usageCount >= DAILY_LIMIT ? `Unlocked in ${countdown || '...'}` : 'Analyze My Finances'}
						<ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
					</button>
				</section>
			)}

			{loading && (
				<div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/60 backdrop-blur-sm">
					<Loader2 className="animate-spin text-purple-400 mb-4" size={64} />
					<p className="text-xl font-bold text-white mb-2">{LOADING_MESSAGES[loadingMsgIndex]}</p>
					<p className="text-sm text-slate-500 font-medium italic">Running projections...</p>
				</div>
			)}

			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 mb-8 flex items-center gap-4 animate-in zoom-in duration-300">
					<AlertCircle size={24} className="shrink-0" />
					<div>
						<p className="font-bold uppercase tracking-tight text-sm">Issue Found</p>
						<p className="text-xs opacity-80">{error}</p>
					</div>
				</div>
			)}

			{advice && (
				<div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
								className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 flex items-start justify-between backdrop-blur-sm hover:border-slate-700 transition-all duration-300 group"
							>
								<div>
									<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
									<h3 className={`text-3xl font-bold ${stat.label === 'Audit Status' ? 'text-emerald-400 italic' : 'text-white'}`}>
										{stat.value}
									</h3>
								</div>
								<div
									className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform`}
								>
									<stat.icon size={24} />
								</div>
							</div>
						))}
					</div>

					<div className="bg-slate-900/50 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-sm p-8 md:p-12 shadow-2xl">
						<div className="prose prose-invert max-w-none">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => (
										<h1 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4 text-white uppercase tracking-tight" {...props} />
									),
									h2: ({ ...props }) => (
										<h2 className="text-xl font-bold mt-8 mb-4 text-white border-l-4 border-purple-500 pl-3" {...props} />
									),
									p: ({ ...props }) => <p className="text-slate-300 mb-4 leading-relaxed" {...props} />,
									li: ({ children }) => (
										<div className="p-4 px-6 mb-2 flex items-start gap-3 bg-slate-800/30 rounded-2xl border border-slate-700/40 group hover:bg-slate-800/50 transition-all">
											<ChevronRight size={18} className="mt-1 text-purple-400 shrink-0 group-hover:translate-x-1 transition-transform" />
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
						{usageCount < DAILY_LIMIT && (
							<button
								onClick={handleAnalyze}
								className="mt-8 text-purple-400 font-bold underline cursor-pointer hover:text-purple-300 transition-colors"
							>
								Refresh Audit
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
