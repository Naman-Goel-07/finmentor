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

	// Cycles through loading messages every 3 seconds
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

			// Parallel fetch for speed
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
		<div className="max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8 text-center md:text-left">
				<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
					AI Coach
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic">Personalized financial intervention by Gemini Flash.</p>
			</header>

			{/* Clean Action Card */}
			{!advice && !loading && (
				<div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
					<div className="p-8 md:p-12 text-center relative z-10">
						<div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
							<Zap size={40} fill="currentColor" />
						</div>
						<h2 className="text-3xl font-bold text-gray-800 mb-4">Stop Guessing, Start Growing</h2>

						<div className="mb-8 max-w-xs mx-auto">
							<label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Monthly Budget (₹)</label>
							<input
								type="number"
								value={monthlyBudget}
								onChange={(e) => setMonthlyBudget(e.target.value)}
								className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-gray-900 text-xl"
							/>
						</div>

						<p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
							FinMentor AI will audit your spending vs. your goals to find your hidden wealth.
						</p>

						<button
							onClick={handleAnalyze}
							className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 rounded-xl hover:bg-black w-full md:w-auto cursor-pointer"
						>
							Analyze My Finances
							<ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
						</button>
					</div>
					<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-100 rounded-full opacity-20 blur-3xl"></div>
				</div>
			)}

			{/* Dynamic Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-20">
					<div className="relative">
						<Loader2 className="animate-spin text-indigo-600 mb-4" size={64} />
						<Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-bounce" size={24} />
					</div>
					<p className="text-xl font-medium text-gray-600">{LOADING_MESSAGES[loadingMsgIndex]}</p>
					<p className="text-sm text-gray-400 mt-2 italic">Checking deadlines and spending leaks...</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 mb-8 flex items-start">
					<AlertCircle className="w-6 h-6 mr-4 text-red-600 mt-1 shrink-0" />
					<div>
						<h3 className="font-bold text-red-900">Coach is stuck!</h3>
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Advice Result */}
			{advice && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<TrendingDown className="text-indigo-600 mb-2" size={24} />
							<p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Items Scanned</p>
							<p className="text-2xl font-bold">{expenseCount}</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<Target className="text-amber-500 mb-2" size={24} />
							<p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Budget Limit</p>
							<p className="text-2xl font-bold">₹{monthlyBudget}</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<Sparkles className="text-green-500 mb-2" size={24} />
							<p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Status</p>
							<p className="text-2xl font-bold italic text-green-600">Complete</p>
						</div>
					</div>

					<div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-xl relative w-full overflow-hidden">
						<div className="prose prose-slate max-w-none w-full text-left">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-900" {...props} />,
									h2: ({ ...props }) => (
										<h2 className="text-xl font-bold mt-8 mb-4 text-gray-900 border-l-4 border-indigo-600 pl-3" {...props} />
									),
									p: ({ ...props }) => <p className="text-gray-700 text-base leading-relaxed mb-4 font-medium" {...props} />,
									ul: ({ ...props }) => <ul className="space-y-3 my-4 list-none pl-0 w-full" {...props} />,
									li: ({ children, ...props }) => (
										<li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2 w-full" {...props}>
											<ChevronRight size={18} className="mt-1 text-indigo-500 shrink-0" />
											<span className="text-gray-900 font-semibold">{children}</span>
										</li>
									),
									strong: ({ ...props }) => <strong className="font-bold text-indigo-600" {...props} />,
									blockquote: ({ ...props }) => (
										<div className="bg-slate-900 text-white p-6 my-6 italic rounded-2xl border-l-8 border-indigo-500 w-full" {...props} />
									),
								}}
							>
								{advice}
							</ReactMarkdown>
						</div>

						<div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-xs text-gray-400 uppercase tracking-widest font-bold">FinMentor AI Coach v2.1</p>
							<button
								onClick={handleAnalyze}
								className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-2 underline-offset-4 cursor-pointer"
							>
								Run New Audit
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
