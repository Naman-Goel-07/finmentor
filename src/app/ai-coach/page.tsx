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

	// Cycles loading messages
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

			// Ensure this URL matches your folder name!
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
			<header className="mb-8">
				<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
					AI Coach
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic">Personalized financial intervention by Gemini.</p>
			</header>

			{/* INITIAL ACTION CARD (Matches Dashboard Welcome Style) */}
			{!advice && !loading && (
				<section className="bg-slate-900/50 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-16 text-center backdrop-blur-sm relative group">
					<div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner z-10 transition-transform group-hover:scale-110">
						<Zap className="text-purple-400" size={32} fill="currentColor" />
					</div>

					<h2 className="text-3xl font-extrabold text-white mb-6">Stop Guessing, Start Growing 🚀</h2>

					<div className="mb-8 max-w-xs mx-auto">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-center font-bold text-white text-xl focus:border-purple-500 transition-all"
						/>
					</div>

					<button
						onClick={handleAnalyze}
						className="px-8 py-4 font-bold text-white bg-slate-900 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all flex items-center justify-center mx-auto gap-2"
					>
						Analyze My Finances <ChevronRight size={20} />
					</button>
				</section>
			)}

			{/* LOADING STATE (Matches Dashboard Blur) */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/60 backdrop-blur-sm">
					<Loader2 className="animate-spin text-purple-400 mb-4" size={64} />
					<p className="text-xl font-bold text-white mb-2">{LOADING_MESSAGES[loadingMsgIndex]}</p>
					<p className="text-sm text-slate-500 font-medium italic">Running projections...</p>
				</div>
			)}

			{/* ADVICE RESULT */}
			{advice && (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Items Scanned</p>
								<h3 className="text-3xl font-bold text-white">{expenseCount}</h3>
							</div>
							<div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
								<TrendingDown size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Budget Limit</p>
								<h3 className="text-3xl font-bold text-white">₹{Number(monthlyBudget).toLocaleString('en-IN')}</h3>
							</div>
							<div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
								<Target size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Audit Status</p>
								<h3 className="text-3xl font-bold text-emerald-400 italic">Complete</h3>
							</div>
							<div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
								<Sparkles size={24} />
							</div>
						</div>
					</div>

					<div className="bg-slate-900/50 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-sm">
						<div className="p-8 md:p-12">
							<div className="prose prose-invert max-w-none">
								<ReactMarkdown
									components={{
										h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-6 border-b border-slate-800 pb-4 text-white" {...props} />,
										h2: ({ ...props }) => (
											<h2 className="text-xl font-bold mt-8 mb-4 text-white border-l-4 border-purple-500 pl-3" {...props} />
										),
										p: ({ ...props }) => <p className="text-slate-300 mb-4" {...props} />,
										li: ({ children }) => (
											<div className="p-4 px-6 mb-2 flex items-start gap-3 bg-slate-800/30 rounded-2xl border border-slate-700/40">
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
							<button onClick={handleAnalyze} className="mt-8 text-purple-400 font-bold underline cursor-pointer">
								Refresh Analysis
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
