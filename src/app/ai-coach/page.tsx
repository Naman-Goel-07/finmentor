'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
	'Scanning for Zomato addiction...',
	'Calculating how many SIPs you missed for that coffee...',
	'Consulting the wealth spirits...',
	'Auditing your financial life choices...',
	'Running SIP projections vs. your current vibes...',
	"Checking if you'll actually hit those goal deadlines...",
	'Preparing a brutal roast for your UPI history...',
	'Analyzing spending patterns... stay calm.',
]

export default function AICoachPage() {
	const [loading, setLoading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)
	const [monthlyBudget, setMonthlyBudget] = useState('10000')
	const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

	const supabase = createClient()

	// Dynamic Loading Message Effect
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
		setLoadingMsgIndex(0)

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			if (!user) throw new Error('You must be logged in to use the AI Coach.')

			// 1. Parallel Fetch: Expenses and Goals
			const [expensesRes, goalsRes] = await Promise.all([
				supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(20),
				supabase.from('goals').select('id, goal_name, target_amount, deadline').eq('user_id', user.id).eq('is_archived', false),
			])

			if (expensesRes.error) throw new Error('Expenses failed: ' + expensesRes.error.message)
			if (goalsRes.error) throw new Error('Goals failed: ' + goalsRes.error.message)

			if (!expensesRes.data || expensesRes.data.length === 0) {
				throw new Error('No expenses found. Add some transactions so the Coach has data to analyze!')
			}

			setExpenseCount(expensesRes.data.length)

			// 2. Call the AI Coach API
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 25000)

			const response = await fetch('/api/ai-coach', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					income: Number(monthlyBudget),
					expenses: expensesRes.data,
					goals: goalsRes.data,
				}),
				signal: controller.signal,
			})

			clearTimeout(timeoutId)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'AI server is taking a nap.' }))
				throw new Error(errorData.error || 'Failed to analyze spending.')
			}

			const data = await response.json()
			setAdvice(data.advice)
		} catch (err: any) {
			setError(err.name === 'AbortError' ? 'The AI is taking too long. Please try again.' : err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-12">
			<header className="mb-12 text-center">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">
					<Sparkles size={14} /> FinMentor AI v2.5
				</div>
				<h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">AI Coach</h1>
				<p className="text-slate-500 font-medium max-w-lg mx-auto">The bridge between your current spending and your future wealth.</p>
			</header>

			{/* Initial Action Card */}
			{!advice && !loading && (
				<div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden relative">
					<div className="p-10 md:p-16 text-center relative z-10">
						<div className="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 -rotate-6 shadow-xl shadow-indigo-200">
							<Zap size={48} fill="currentColor" />
						</div>

						<h2 className="text-3xl font-black text-slate-900 mb-4">Audit Your Future</h2>

						{/* Budget Input Section */}
						<div className="mb-10 max-w-xs mx-auto">
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Monthly Budget (₹)</label>
							<div className="relative">
								<span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
								<input
									type="number"
									value={monthlyBudget}
									onChange={(e) => setMonthlyBudget(e.target.value)}
									className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-slate-900 text-2xl outline-none focus:border-indigo-500 transition-all"
								/>
							</div>
						</div>

						<button
							onClick={handleAnalyze}
							className="group w-full md:w-auto px-10 py-5 font-black text-white bg-slate-900 rounded-2xl hover:bg-black transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center mx-auto gap-3 shadow-xl shadow-slate-200 cursor-pointer"
						>
							Analyze Finances <ChevronRight size={20} />
						</button>
					</div>
				</div>
			)}

			{/* Dynamic Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
					<div className="relative mb-8">
						<div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
						<Loader2 className="animate-spin text-indigo-600 relative z-10" size={80} strokeWidth={3} />
					</div>
					<p className="text-2xl font-black text-slate-900 mb-2">{LOADING_MESSAGES[loadingMsgIndex]}</p>
					<div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
						<Coins size={16} className="animate-bounce" />
						Gemini is crunching the numbers
					</div>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 mb-8 flex items-start gap-5">
					<div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
						<AlertCircle className="text-red-600" size={24} />
					</div>
					<div>
						<h3 className="font-black text-red-900 text-xl mb-1">Coach is Stuck!</h3>
						<p className="text-red-700 font-medium leading-relaxed">{error}</p>
						<button onClick={handleAnalyze} className="mt-4 text-sm font-black text-red-900 underline underline-offset-4 hover:text-red-600">
							Try Again
						</button>
					</div>
				</div>
			)}

			{/* Advice Result Card */}
			{advice && (
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
					{/* Quick Stat Highlights */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
							<TrendingDown className="text-indigo-600 mb-4" size={28} />
							<p className="text-xs font-black text-slate-400 uppercase tracking-widest">Items Scanned</p>
							<p className="text-3xl font-black text-slate-900">{expenseCount}</p>
						</div>
						<div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
							<Target className="text-amber-500 mb-4" size={28} />
							<p className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget Goal</p>
							<p className="text-3xl font-black text-slate-900">₹{monthlyBudget}</p>
						</div>
						<div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
							<Sparkles className="text-green-500 mb-4" size={28} />
							<p className="text-xs font-black text-slate-400 uppercase tracking-widest">Audit Score</p>
							<p className="text-3xl font-black text-green-600 italic">LIVE</p>
						</div>
					</div>

					{/* AI Main Card */}
					<div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
						<div className="prose prose-slate max-w-none w-full">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => (
										<h1 className="text-3xl font-black mb-8 border-b-4 border-slate-900 pb-6 text-slate-900" {...props} />
									),
									h2: ({ ...props }) => <h2 className="text-2xl font-black mt-12 mb-6 text-slate-900 flex items-center gap-3" {...props} />,
									p: ({ ...props }) => <p className="text-slate-700 text-lg leading-relaxed mb-6 font-medium" {...props} />,
									ul: ({ ...props }) => <ul className="space-y-4 my-8 list-none pl-0" {...props} />,
									li: ({ children }) => (
										<li className="flex items-start gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-bold text-slate-800">
											<div className="mt-1 bg-indigo-600 rounded-full p-1">
												<ChevronRight size={16} className="text-white" />
											</div>
											{children}
										</li>
									),
									strong: ({ ...props }) => <strong className="font-black text-indigo-600" {...props} />,
									blockquote: ({ ...props }) => (
										<div
											className="bg-slate-900 text-white p-8 my-10 italic rounded-3xl border-l-[12px] border-indigo-600 shadow-xl"
											{...props}
										/>
									),
								}}
							>
								{advice}
							</ReactMarkdown>
						</div>

						<div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
							<p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">FinMentor Intelligence Protocol</p>
							<button
								onClick={handleAnalyze}
								className="px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-black text-indigo-600 transition-all active:scale-95"
							>
								Re-Audit Profile
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
