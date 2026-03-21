'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Calculating missed SIP opportunities...',
	'Consulting the wealth spirits...',
	'Auditing your spending habits...',
	'Checking goal deadlines...',
	'Preparing your financial roast...',
	'Analyzing patterns... stay calm.',
]

export default function AICoachPage() {
	const [loading, setLoading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)
	const [monthlyBudget, setMonthlyBudget] = useState('10000')
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

	const supabase = createClient()

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
			if (!user) throw new Error('Unauthorized')

			const [expensesRes, goalsRes] = await Promise.all([
				supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
				supabase.from('goals').select('id, goal_name, target_amount, deadline').eq('user_id', user.id).eq('is_archived', false),
			])

			if (expensesRes.error) throw expensesRes.error

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
			if (!response.ok) throw new Error(data.error || 'Failed to analyze.')

			setAdvice(data.advice)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="animate-in fade-in duration-500 max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
						AI Coach
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic">Personalized financial intervention by Gemini Flash.</p>
				</div>
			</header>

			{/* ACTION CARD: Styled like your Dashboard "Welcome" section */}
			{!advice && !loading && (
				<section className="bg-slate-900/40 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-16 text-center backdrop-blur-sm animate-in zoom-in-95 duration-500 flex flex-col items-center relative group">
					<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

					<div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
						<Zap className="text-purple-400 fill-purple-500/10" size={32} />
					</div>

					<h2 className="text-3xl font-extrabold text-white mb-3 z-10 relative">Stop Guessing, Start Growing 🚀</h2>

					<div className="mb-8 max-w-xs mx-auto z-10 relative">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center font-bold text-white text-xl backdrop-blur-md"
						/>
					</div>

					<p className="text-slate-400 max-w-lg mx-auto mb-8 font-medium text-[15px] leading-relaxed z-10 relative">
						FinMentor AI scans your data to find hidden savings. Ready for the truth?
					</p>

					<button
						onClick={handleAnalyze}
						className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-slate-900 border border-slate-700 hover:border-purple-500/50 rounded-xl w-full md:w-auto cursor-pointer z-10"
					>
						Analyze My Finances
						<ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
					</button>
				</section>
			)}

			{/* LOADING STATE */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-20 animate-pulse">
					<div className="relative mb-6">
						<Loader2 className="animate-spin text-purple-400" size={64} />
						<Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" size={24} />
					</div>
					<p className="text-xl font-bold text-white">{LOADING_MESSAGES[loadingMsgIndex]}</p>
				</div>
			)}

			{/* ERROR STATE */}
			{error && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-bold text-red-200">Coach is stuck!</h3>
						<p className="mt-1 text-sm opacity-80">{error}</p>
					</div>
				</div>
			)}

			{advice && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
					{/* STAT CARDS: Matches your Dashboard KPI style */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Items Scanned</p>
								<h3 className="text-3xl font-bold text-white">{expenseCount}</h3>
							</div>
							<div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
								<TrendingDown size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Budget Limit</p>
								<h3 className="text-3xl font-bold text-white">₹{Number(monthlyBudget).toLocaleString('en-IN')}</h3>
							</div>
							<div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
								<Target size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Audit Status</p>
								<h3 className="text-3xl font-bold text-emerald-400 italic">Complete</h3>
							</div>
							<div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
								<Sparkles size={24} />
							</div>
						</div>
					</div>

					{/* ADVICE CARD: Matches your Dashboard's "Recent Transactions" list container */}
					<div className="bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 overflow-hidden backdrop-blur-sm">
						<div className="p-8 md:p-12">
							<div className="prose prose-slate prose-invert max-w-none">
								<ReactMarkdown
									components={{
										h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4 text-white" {...props} />,
										h2: ({ ...props }) => (
											<h2 className="text-xl font-bold mt-8 mb-4 text-white border-l-4 border-purple-500 pl-3" {...props} />
										),
										p: ({ ...props }) => <p className="text-slate-300 text-base leading-relaxed mb-4 font-medium" {...props} />,
										ul: ({ ...props }) => <ul className="space-y-3 my-4 list-none pl-0" {...props} />,
										li: ({ children }) => (
											<div className="p-4 px-6 mb-2 flex items-start gap-3 bg-slate-800/30 rounded-2xl border border-slate-700/40 hover:bg-slate-800/50 transition-colors">
												<ChevronRight size={18} className="mt-1 text-purple-400 shrink-0" />
												<span className="text-slate-100 font-bold">{children}</span>
											</div>
										),
										strong: ({ ...props }) => <strong className="font-extrabold text-white bg-purple-500/20 px-1 rounded" {...props} />,
										blockquote: ({ ...props }) => (
											<div
												className="bg-slate-950/60 text-slate-300 p-6 my-6 italic rounded-2xl border-l-8 border-purple-500"
												{...props}
											/>
										),
									}}
								>
									{advice}
								</ReactMarkdown>
							</div>

							<div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
								<p className="text-xs text-slate-500 font-bold uppercase tracking-widest">FinMentor AI Protocol</p>
								<button onClick={handleAnalyze} className="text-purple-400 text-sm font-bold hover:underline cursor-pointer">
									Refresh Analysis
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
