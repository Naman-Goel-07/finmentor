'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Activity, Clock, RotateCcw, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Consulting the wealth spirits...',
	'Preparing your financial roast...',
	'Analyzing patterns... stay calm.',
]

const DAILY_LIMIT = 10

export default function AICoachPage() {
	const router = useRouter()
	const supabase = createClient()

	// PDF Capture Ref
	const reportRef = useRef<HTMLDivElement>(null)

	// Identity & Init State
	const [isReady, setIsReady] = useState(false)
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)

	// UI States
	const [loading, setLoading] = useState(false)
	const [isDownloading, setIsDownloading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)
	const [monthlyBudget, setMonthlyBudget] = useState('10000')
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

	// Usage & Countdown States
	const [usageCount, setUsageCount] = useState(0)
	const [nextResetTime, setNextResetTime] = useState<string | null>(null)
	const [countdown, setCountdown] = useState<string>('')

	// 1. ONE-TIME INIT: Kills the refresh loop and uses sessionStorage
	useEffect(() => {
		const initializeSession = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser()

				if (user) {
					setCurrentUserId(user.id)

					// Hydrate from Session Cache (temporary, acts like Next.js cache)
					const cachedAdvice = sessionStorage.getItem(`finmentor_advice_${user.id}`)
					const cachedBudget = sessionStorage.getItem(`finmentor_budget_${user.id}`)
					const cachedCount = sessionStorage.getItem(`finmentor_count_${user.id}`)

					if (cachedAdvice) setAdvice(cachedAdvice)
					if (cachedBudget) setMonthlyBudget(cachedBudget)
					if (cachedCount) setExpenseCount(parseInt(cachedCount))

					// Fetch usage exactly once on mount
					const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
					const { data, count } = await supabase
						.from('ai_logs')
						.select('created_at', { count: 'exact' })
						.eq('user_id', user.id)
						.eq('status_code', 200)
						.gt('created_at', last24h)
						.order('created_at', { ascending: true })

					setUsageCount(count || 0)
					setNextResetTime(data && data.length > 0 ? data[0].created_at : null)
				}
			} catch (e) {
				console.error('Initialization failed:', e)
			} finally {
				setIsReady(true) // Unlocks the UI
			}
		}

		initializeSession()
	}, []) // <-- Empty array guarantees this runs ONLY once, preventing hangs.

	// 2. BULLETPROOF PDF HANDLER
	const handleDownloadPDF = async () => {
		if (!reportRef.current) return
		setIsDownloading(true)

		try {
			// Let the UI/animations settle before taking the picture
			await new Promise((resolve) => setTimeout(resolve, 300))
			const element = reportRef.current

			const canvas = await html2canvas(element, {
				scale: 2,
				backgroundColor: '#0f172a', // Enforce dark theme
				useCORS: true,
				allowTaint: true,
				logging: false,
				windowWidth: element.scrollWidth,
				windowHeight: element.scrollHeight,
			})

			const imgData = canvas.toDataURL('image/png')

			// Fit to standard A4 size to prevent browser memory crashes
			const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = (canvas.height * pdfWidth) / canvas.width

			pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
			pdf.save(`FinMentor-Audit-${new Date().toISOString().split('T')[0]}.pdf`)
		} catch (err) {
			console.error('PDF Export failed:', err)
			alert('Failed to save PDF. Please try again.')
		} finally {
			setIsDownloading(false)
		}
	}

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

			// Save to Session Cache
			sessionStorage.setItem(`finmentor_advice_${currentUserId}`, data.advice)
			sessionStorage.setItem(`finmentor_budget_${currentUserId}`, monthlyBudget)
			sessionStorage.setItem(`finmentor_count_${currentUserId}`, currentCount.toString())

			// Optimistically update usage count (prevents needing another fetch)
			if (data.error !== 'DAILY_LIMIT_REACHED') {
				setUsageCount((prev) => prev + 1)
			}

			router.refresh()
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const clearActiveAudit = () => {
		setAdvice(null)
		if (currentUserId) {
			sessionStorage.removeItem(`finmentor_advice_${currentUserId}`)
			sessionStorage.removeItem(`finmentor_budget_${currentUserId}`)
			sessionStorage.removeItem(`finmentor_count_${currentUserId}`)
		}
	}

	// Countdown Timer
	useEffect(() => {
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
				window.location.reload() // Clean refresh when slot opens
			} else {
				const hours = Math.floor(diff / (1000 * 60 * 60))
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
				const seconds = Math.floor((diff % (1000 * 60)) / 1000)
				setCountdown(`${hours}h ${minutes}m ${seconds}s`)
			}
		}, 1000)

		return () => clearInterval(timer)
	}, [nextResetTime, usageCount])

	// Loading Message Cycler
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (loading) {
			interval = setInterval(() => {
				setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
			}, 3000)
		}
		return () => clearInterval(interval)
	}, [loading])

	// Guard Render
	if (!isReady) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
				<p className="text-slate-400 font-medium animate-pulse">Syncing AI Protocol...</p>
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
					<Zap className="text-purple-400 mx-auto mb-6 transition-transform group-hover:scale-110" size={48} />
					<h2 className="text-3xl font-extrabold text-white mb-6">Ready for an intervention? 🚀</h2>
					<div className="mb-8 max-w-xs mx-auto">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							disabled={usageCount >= DAILY_LIMIT}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-center font-bold text-white text-xl focus:border-purple-500 transition-all disabled:opacity-30"
						/>
					</div>
					<button
						onClick={handleAnalyze}
						disabled={usageCount >= DAILY_LIMIT}
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
						<div className="flex gap-4">
							<button
								onClick={handleDownloadPDF}
								disabled={isDownloading}
								className="text-xs font-black text-blue-400 flex items-center gap-1.5 hover:text-blue-300 transition-colors disabled:opacity-50"
							>
								{isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
								SAVE PDF
							</button>
							<button
								onClick={handleAnalyze}
								disabled={usageCount >= DAILY_LIMIT}
								className="text-xs font-black text-purple-400 hover:text-purple-300 transition-colors uppercase"
							>
								Run New Audit →
							</button>
						</div>
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

					<div ref={reportRef} className="bg-[#0f172a] rounded-3xl border border-slate-800/60 p-8 md:p-12 shadow-2xl relative overflow-hidden">
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
