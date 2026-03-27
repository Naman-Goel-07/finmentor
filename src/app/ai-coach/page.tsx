'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Activity, Clock, RotateCcw, MessageCircle, Scissors, BarChart3, Lightbulb, CalendarCheck, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import ReactMarkdown from 'react-markdown'

// 1. SINGLETON CLIENT: Prevents re-auth cycles on every render
const supabase = createClient()

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Consulting the wealth spirits...',
	'Preparing your financial roast...',
	'Analyzing patterns... stay calm.',
]

const DAILY_LIMIT = 10

export default function AICoachPage() {
	const { user } = useAuth()
	const currentUserId = user?.id
	const adviceRef = useRef<HTMLDivElement>(null)

	// State Guards
	const [isReady, setIsReady] = useState(false)

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

	// Interactive Action States
	const [actionResponse, setActionResponse] = useState('')
	const [actionLoading, setActionLoading] = useState(false)
	const [showInput, setShowInput] = useState(false)
	const [userQuery, setUserQuery] = useState('')
	const actionRef = useRef<HTMLDivElement>(null)
	const [countdown, setCountdown] = useState<string>('')

	// REVALIDATION HELPER: Ensures the Auth Token is attached before querying
	const syncUsageFromDB = async (userId: string) => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (!session) await new Promise((resolve) => setTimeout(resolve, 500))

			const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

			const {
				count,
				data,
				error: dbError,
			} = await supabase
				.from('ai_logs')
				.select('created_at', { count: 'exact' })
				.eq('user_id', userId)
				.eq('status_code', 200)
				.gt('created_at', last24h)
				.order('created_at', { ascending: true })

			if (dbError) throw dbError

			const freshCount = count || 0
			setUsageCount(freshCount)
			sessionStorage.setItem('finmentor_usage', freshCount.toString())

			if (data && data.length > 0) {
				setNextResetTime(data[0].created_at)
			} else {
				setNextResetTime(null)
			}
			return freshCount
		} catch (err) {
			console.error('DB Sync failed:', err)
			return 0
		}
	}

	// 1. BOOTSTRAP: Load Cache + Sync DB
	useEffect(() => {
		let isMounted = true

		const initializeCoach = async () => {
			const cachedAdvice = sessionStorage.getItem('finmentor_advice')
			const cachedBudget = sessionStorage.getItem('finmentor_budget')
			const cachedCount = sessionStorage.getItem('finmentor_count')
			const cachedUsage = sessionStorage.getItem('finmentor_usage')

			if (cachedAdvice) setAdvice(cachedAdvice)
			if (cachedBudget) setMonthlyBudget(cachedBudget)
			if (cachedCount) setExpenseCount(parseInt(cachedCount))
			if (cachedUsage) setUsageCount(parseInt(cachedUsage))

			if (isMounted) setIsReady(true)

			if (currentUserId) {
				await syncUsageFromDB(currentUserId)
			}
		}

		initializeCoach()
		return () => {
			isMounted = false
		}
	}, [currentUserId])

	// UX: Auto-scroll to advice when it arrives
	useEffect(() => {
		if (advice && adviceRef.current) {
			adviceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}, [advice])

	// 2. ANALYZE
	const handleAnalyze = async () => {
		if (!currentUserId || usageCount >= DAILY_LIMIT) return
		setLoading(true)
		setError(null)

		try {
			// Get current month boundaries
			const now = new Date()
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
			const endOfToday = now.toISOString()

			const [expensesRes, goalsRes] = await Promise.all([
				supabase.from('expenses').select('*').eq('user_id', currentUserId).gte('date', startOfMonth).lte('date', endOfToday).order('date', { ascending: false }).limit(100),
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

			setAdvice(data.advice)
			setExpenseCount(currentCount)

			sessionStorage.setItem('finmentor_advice', data.advice)
			sessionStorage.setItem('finmentor_budget', monthlyBudget)
			sessionStorage.setItem('finmentor_count', currentCount.toString())

			await syncUsageFromDB(currentUserId)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const clearActiveAudit = () => {
		setAdvice(null)
		setActionResponse('')
		setShowInput(false)
		setUserQuery('')
		sessionStorage.removeItem('finmentor_advice')
		sessionStorage.removeItem('finmentor_budget')
		sessionStorage.removeItem('finmentor_count')
		sessionStorage.removeItem('finmentor_usage')
	}

	const handleAction = async (type: string) => {
		if (!advice || actionLoading) return
		setActionLoading(true)
		setActionResponse('')

		const prompts: Record<string, string> = {
			summarize: `Summarize this financial report in 50 words or less. Be sharp and direct:\n\n${advice}`,
			problems: `List the top 3 most critical financial problems from this report. Number them. Be blunt:\n\n${advice}`,
			tips: `Give exactly 5 actionable, practical financial tips based on this report. Be specific, not generic:\n\n${advice}`,
			today: `Based on this financial report, give exactly 3 concrete actions the user should take TODAY. Be urgent and motivating:\n\n${advice}`,
		}

		try {
			const res = await fetch('/api/ai-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: prompts[type] }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.details || data.error || 'Something went wrong')
			setActionResponse(data.advice)
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to get response'
			setActionResponse(`❌ ${message}`)
		} finally {
			setActionLoading(false)
			setTimeout(() => actionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
		}
	}

	const handleFollowUp = async () => {
		if (!userQuery.trim() || actionLoading) return
		setActionLoading(true)
		setActionResponse('')

		try {
			const res = await fetch('/api/ai-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: `${userQuery}\n\nContext from my financial report:\n${advice}`,
				}),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.details || data.error || 'Something went wrong')
			setActionResponse(data.advice)
			setUserQuery('')
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Failed to get response'
			setActionResponse(`❌ ${message}`)
		} finally {
			setActionLoading(false)
			setTimeout(() => actionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
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

	// Loading message cycler
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (loading) {
			interval = setInterval(() => {
				setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
			}, 3000)
		}
		return () => clearInterval(interval)
	}, [loading])

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
							{!isReady && <Loader2 size={12} className="animate-spin text-purple-400" />}
							{isReady && `${usageCount}/${DAILY_LIMIT}`}
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
						<label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
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
				<div ref={adviceRef} className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ label: 'This Month', value: expenseCount, icon: TrendingDown, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
									className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110`}
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
										<h1 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4 text-white uppercase" {...props} />
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
								}}
							>
								{advice}
							</ReactMarkdown>
						</div>
						{/* === ACTION BUTTONS === */}
						<div className="mt-8 pt-6 border-t border-slate-800/60">
							<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
								<Sparkles size={12} className="text-purple-400" /> Quick Actions
							</p>
							<div className="flex flex-wrap gap-2">
								{[
									{ key: 'summarize', label: 'Summarize', icon: Scissors, color: 'hover:border-cyan-500/50 hover:text-cyan-400' },
									{ key: 'problems', label: 'Key Problems', icon: BarChart3, color: 'hover:border-red-500/50 hover:text-red-400' },
									{ key: 'tips', label: 'Quick Tips', icon: Lightbulb, color: 'hover:border-amber-500/50 hover:text-amber-400' },
									{ key: 'today', label: 'What to do today', icon: CalendarCheck, color: 'hover:border-emerald-500/50 hover:text-emerald-400' },
								].map((action) => (
									<button
										key={action.key}
										onClick={() => handleAction(action.key)}
										disabled={actionLoading}
										className={`px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800/50 border border-slate-700/60 rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${action.color}`}
									>
										<action.icon size={14} />
										{action.label}
									</button>
								))}
								<button
									onClick={() => setShowInput((v) => !v)}
									className={`px-4 py-2.5 text-xs font-bold border rounded-xl transition-all flex items-center gap-2 active:scale-95 ${
										showInput
											? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
											: 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-purple-500/50 hover:text-purple-400'
									}`}
								>
									<MessageCircle size={14} />
									Ask Follow-up
								</button>
							</div>
						</div>

						{/* === FOLLOW-UP INPUT === */}
						{showInput && (
							<div className="mt-4 flex gap-2 animate-in slide-in-from-top-2 duration-300">
								<input
									value={userQuery}
									onChange={(e) => setUserQuery(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
									placeholder="Ask anything about your finances..."
									disabled={actionLoading}
									className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-sm font-medium text-white placeholder:text-slate-500 focus:border-purple-500 transition-all disabled:opacity-30"
								/>
								<button
									onClick={handleFollowUp}
									disabled={actionLoading || !userQuery.trim()}
									className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
								>
									<Send size={14} />
									Ask
								</button>
							</div>
						)}

						{/* === ACTION RESPONSE === */}
						{actionLoading && (
							<div className="mt-4 flex items-center justify-center py-8 bg-slate-800/30 rounded-2xl border border-slate-700/40 animate-pulse">
								<Loader2 className="animate-spin text-purple-400 mr-3" size={20} />
								<span className="text-sm font-bold text-slate-400">Thinking...</span>
							</div>
						)}

						{actionResponse && !actionLoading && (
							<div ref={actionRef} className="mt-4 p-6 bg-slate-800/40 rounded-2xl border border-purple-500/20 animate-in slide-in-from-bottom-4 duration-500">
								<p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
									<MessageCircle size={12} /> AI Response
								</p>
								<div className="prose prose-invert prose-sm max-w-none text-slate-300">
									<ReactMarkdown
										components={{
											h1: ({ ...props }) => (
												<h1 className="text-lg font-bold mb-3 text-white" {...props} />
											),
											h2: ({ ...props }) => (
												<h2 className="text-base font-bold mt-4 mb-2 text-white border-l-2 border-purple-500 pl-2" {...props} />
											),
											li: ({ children }) => (
												<div className="p-3 px-4 mb-1.5 flex items-start gap-2 bg-slate-700/20 rounded-xl border border-slate-700/30">
													<ChevronRight size={14} className="mt-0.5 text-purple-400 shrink-0" />
													<span className="text-slate-200 font-medium text-sm">{children}</span>
												</div>
											),
											strong: ({ ...props }) => <strong className="font-extrabold text-white" {...props} />,
										}}
									>
										{actionResponse}
									</ReactMarkdown>
								</div>
							</div>
						)}

						<div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
							<button
								onClick={clearActiveAudit}
								className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors font-black uppercase tracking-tighter"
							>
								Clear This Report
							</button>
							<span className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase font-bold">AI Protocol Active</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
