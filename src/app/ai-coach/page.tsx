'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, TrendingDown, Zap, Target, ChevronRight } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import ReactMarkdown from 'react-markdown'

export default function AICoachPage() {
	const [loading, setLoading] = useState(false)
	const [advice, setAdvice] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [expenseCount, setExpenseCount] = useState(0)

	const handleAnalyze = async () => {
		setLoading(true)
		setError(null)
		setAdvice(null)

		try {
			// 1. Fetch expenses from Supabase
			const { data: expenses, error: dbError } = await supabase.from('expenses').select('*').order('date', { ascending: false })

			if (dbError) throw new Error('Database error: ' + dbError.message)

			if (!expenses || expenses.length === 0) {
				throw new Error('No expenses found. Add some transactions first so the Coach has something to roast!')
			}

			setExpenseCount(expenses.length)

			// 2. Send to our API Route
			const response = await fetch('/api/analyze-spending', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					income: 'Student Budget', // You can make this dynamic later
					expenses: expenses,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to analyze spending.')
			}

			setAdvice(data.advice)
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="max-w-4xl mx-auto w-full px-4 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
					AI Coach
				</h1>
				<p className="text-gray-500 mt-1 font-medium">Personalized financial intervention by Gemini 1.5 Flash.</p>
			</header>

			{/* Action Card */}
			{!advice && !loading && (
				<div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
					<div className="p-8 md:p-12 text-center relative z-10">
						<div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
							<Zap size={40} fill="currentColor" />
						</div>
						<h2 className="text-3xl font-bold text-gray-800 mb-4">Stop Guessing, Start Growing</h2>
						<p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
							HarTime Error's Nudge Engine will scan your transactions to find hidden savings and 10x your future wealth.
						</p>

						<button
							onClick={handleAnalyze}
							className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-black w-full md:w-auto"
						>
							Get My Analysis
							<ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
						</button>
					</div>
					{/* Background Decoration */}
					<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-100 rounded-full opacity-20 blur-3xl"></div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-20 animate-pulse">
					<div className="relative">
						<Loader2 className="animate-spin text-indigo-600 mb-4" size={64} />
						<Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-bounce" size={24} />
					</div>
					<p className="text-xl font-medium text-gray-600">Analyzing patterns...</p>
					<p className="text-sm text-gray-400 mt-2">Running SIP projections & spending audits</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 mb-8 flex items-start">
					<AlertCircle className="w-6 h-6 mr-4 text-red-600 mt-1" />
					<div>
						<h3 className="font-bold text-red-900">Coach is stuck!</h3>
						<p className="text-red-700">{error}</p>
					</div>
				</div>
			)}

			{/* Advice Result */}
			{advice && (
				<div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
					{/* Quick Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<div className="text-indigo-600 mb-2">
								<TrendingDown size={24} />
							</div>
							<p className="text-sm text-gray-500">Transactions Audited</p>
							<p className="text-2xl font-bold">{expenseCount}</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<div className="text-amber-500 mb-2">
								<Target size={24} />
							</div>
							<p className="text-sm text-gray-500">Savings Potential</p>
							<p className="text-2xl font-bold">High</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
							<div className="text-green-500 mb-2">
								<Sparkles size={24} />
							</div>
							<p className="text-sm text-gray-500">Wealth Score</p>
							<p className="text-2xl font-bold italic text-green-600">Live</p>
						</div>
					</div>

					{/* AI Content Card */}
					<div className="bg-white border-2 border-indigo-50 rounded-3xl p-8 md:p-10 shadow-2xl relative">
						<div className="prose prose-indigo max-w-none prose-p:text-gray-600 prose-headings:text-gray-900">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => <h1 className="text-2xl font-black mb-6 flex items-center gap-2 border-b pb-4" {...props} />,
									h2: ({ ...props }) => <h2 className="text-xl font-bold mt-8 mb-4 text-indigo-900" {...props} />,
									ul: ({ ...props }) => <ul className="space-y-3 my-4" {...props} />,
									li: ({ ...props }) => (
										<li className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100" {...props}>
											<ChevronRight size={18} className="mt-1 text-indigo-500 flex-shrink-0" />
											<span className="text-gray-700">{props.children}</span>
										</li>
									),
									strong: ({ ...props }) => <strong className="font-bold text-indigo-600" {...props} />,
									blockquote: ({ ...props }) => (
										<div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6 italic text-amber-900 rounded-r-lg" {...props} />
									),
								}}
							>
								{advice}
							</ReactMarkdown>
						</div>

						<div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-xs text-gray-400 uppercase tracking-widest font-bold">FinMentor AI Engine v1.0</p>
							<button
								onClick={handleAnalyze}
								className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4"
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
