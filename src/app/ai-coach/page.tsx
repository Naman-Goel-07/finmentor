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
			// 1. Fetch recent expenses (Limited to 10 to save API Quota/Tokens)
			const { data: expenses, error: dbError } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(10) // ✅ Crucial for preventing 429 Quota errors

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
					income: 'Student Budget',
					expenses: expenses,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				// ✅ Better error messaging for the 429 Quota issue
				if (response.status === 429) {
					throw new Error('AI is overwhelmed! Google Free Tier limit reached. Please wait 60 seconds and try again.')
				}
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
		<div className="max-w-4xl mx-auto px-4 py-8">
			<header className="mb-8 text-center md:text-left">
				<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
					AI Coach
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic">Personalized financial intervention by Gemini 2.0 Flash.</p>
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
							className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-900 rounded-xl hover:bg-black w-full md:w-auto cursor-pointer"
						>
							Get My Analysis
							<ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
						</button>
					</div>
					<div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-100 rounded-full opacity-20 blur-3xl"></div>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="flex flex-col items-center justify-center py-20">
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
					{/* Quick Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-black">
							<div className="text-indigo-600 mb-2">
								<TrendingDown size={24} />
							</div>
							<p className="text-sm opacity-60">Transactions Audited</p>
							<p className="text-2xl font-bold">{expenseCount}</p>
						</div>
						<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-black">
							<div className="text-amber-500 mb-2">
								<Target size={24} />
							</div>
							<p className="text-sm opacity-60">Savings Potential</p>
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
					<div className="bg-white border-2 border-indigo-50 rounded-3xl p-6 md:p-10 shadow-2xl relative">
						<div className="prose prose-indigo max-w-none">
							<ReactMarkdown
								components={{
									h1: ({ ...props }) => <h1 className="text-2xl font-black mb-6 border-b pb-4 text-black !opacity-100" {...props} />,
									h2: ({ ...props }) => (
										<h2 className="text-xl font-extrabold mt-8 mb-4 text-black !opacity-100 border-l-4 border-indigo-600 pl-3" {...props} />
									),
									h3: ({ ...props }) => (
										<h3 className="text-lg font-black mt-6 mb-2 text-black !opacity-100 flex items-center gap-2" {...props} />
									),
									h4: ({ ...props }) => <h4 className="text-base font-bold mt-4 mb-2 text-black !opacity-100" {...props} />,
									p: ({ ...props }) => <p className="text-black text-base leading-relaxed mb-4 font-medium !opacity-100" {...props} />,
									ul: ({ ...props }) => <ul className="space-y-3 my-4 list-none pl-0" {...props} />,
									ol: ({ ...props }) => <ol className="space-y-3 my-4 list-decimal pl-5 text-black font-bold !opacity-100" {...props} />,
									li: ({ ...props }) => (
										<li className="flex items-start gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2" {...props}>
											<ChevronRight size={18} className="mt-1 text-indigo-500 shrink-0" />
											<span className="text-black font-semibold !opacity-100">{props.children}</span>
										</li>
									),
									strong: ({ ...props }) => (
										<strong className="font-black text-black bg-yellow-100 px-1 rounded-sm !opacity-100" {...props} />
									),
									blockquote: ({ ...props }) => (
										<div className="bg-slate-900 text-white p-6 my-6 italic rounded-2xl border-l-8 border-indigo-500" {...props} />
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
								className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline decoration-2 underline-offset-4 cursor-pointer"
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
