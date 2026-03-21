'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight } from 'lucide-react'
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
			<header className="mb-8">
				<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
					AI Coach
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic">Personalized financial intervention by Gemini.</p>
			</header>

			{/* INITIAL ACTION CARD: Re-added Hover Glow and Scaling */}
			{!advice && !loading && (
				<section className="bg-slate-900/50 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-16 text-center backdrop-blur-sm relative group transition-all duration-500 hover:border-slate-600/80">
					<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

					<div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
						<Zap className="text-purple-400 fill-purple-500/10" size={32} />
					</div>

					<h2 className="text-3xl font-extrabold text-white mb-6 z-10 relative transition-colors group-hover:text-purple-100">
						Stop Guessing, Start Growing 🚀
					</h2>

					<div className="mb-8 max-w-xs mx-auto z-10 relative">
						<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Monthly Budget (₹)</label>
						<input
							type="number"
							value={monthlyBudget}
							onChange={(e) => setMonthlyBudget(e.target.value)}
							className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/60 rounded-xl outline-none text-center font-bold text-white text-xl focus:border-purple-500 transition-all hover:bg-slate-800/80"
						/>
					</div>

					<button
						onClick={handleAnalyze}
						className="px-8 py-4 font-bold text-white bg-slate-900 border border-slate-700 hover:border-purple-500/50 rounded-xl transition-all flex items-center justify-center mx-auto gap-2 z-10 relative active:scale-95"
					>
						Analyze My Finances <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
					</button>
				</section>
			)}

			{/* LOADING STATE */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/60 backdrop-blur-sm">
					<Loader2 className="animate-spin text-purple-400 mb-4" size={64} />
					<p className="text-xl font-bold text-white mb-2">{LOADING_MESSAGES[loadingMsgIndex]}</p>
				</div>
			)}

			{/* ADVICE RESULT */}
			{advice && (
				<div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Stat Cards with hover border brightening */}
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
								className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm hover:border-slate-700/80 hover:bg-slate-900/80 transition-all duration-300 group"
							>
								<div>
									<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
									<h3 className={`text-3xl font-bold ${stat.label === 'Audit Status' ? 'text-emerald-400 italic' : 'text-white'} mb-2`}>
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

					<div className="bg-slate-900/50 rounded-3xl border border-slate-800/60 overflow-hidden backdrop-blur-sm hover:border-slate-700/50 transition-colors duration-500">
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
											<div className="p-4 px-6 mb-2 flex items-start gap-3 bg-slate-800/30 rounded-2xl border border-slate-700/40 hover:bg-slate-800/50 hover:border-slate-600/40 transition-all duration-300 group">
												<ChevronRight
													size={18}
													className="mt-1 text-purple-400 shrink-0 group-hover:translate-x-1 transition-transform"
												/>
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
							<button
								onClick={handleAnalyze}
								className="mt-8 text-purple-400 font-bold underline cursor-pointer hover:text-purple-300 transition-colors"
							>
								Refresh Analysis
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
