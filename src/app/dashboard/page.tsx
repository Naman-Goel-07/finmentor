import { createClient } from '@/lib/supabase/server'
import DashboardCharts from '@/components/DashboardCharts'
import { AlertCircle, ArrowUpRight, IndianRupee, Activity, Star } from 'lucide-react'
import Link from 'next/link'
import AddExpenseModal from '@/components/AddExpenseModal'
import AddGoalModal from '@/components/AddGoalModal'
import WelcomeHeader from '@/components/WelcomeHeader'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

	let expenses: any[] = []
	let dbError = null
	let goalsCount = 0

	if (hasSupabaseUrl) {
		const supabase = await createClient()

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (user) {
				const { data, error } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })

				if (error) {
					dbError = error.message
				} else if (data) {
					expenses = data
				}

				// Check for goals to detect complete onboarding profile
				const { count, error: countError } = await supabase
					.from('goals')
					.select('*', { count: 'exact', head: true })
					.eq('user_id', user.id)
					.eq('is_archived', false)

				if (!countError) goalsCount = count || 0
			}
		} catch (err: any) {
			dbError = 'Network connection failed. Check your Supabase URL.'
			console.error('Dashboard Server Fetch Error:', err)
		}
	}

	const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
	const totalTransactions = expenses.length
	const recentExpenses = expenses.slice(0, 5)

	const hasNoData = expenses.length === 0 && goalsCount === 0 && !dbError

	return (
		<div className="animate-in fade-in duration-500">
			{/* HEADER */}
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<WelcomeHeader />
				<div className="shrink-0 flex items-center gap-3">
					<AddExpenseModal />
				</div>
			</header>

			{dbError && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-bold text-red-200">Database Connection Error</h3>
						<p className="mt-1 text-sm opacity-80">{dbError}</p>
					</div>
				</div>
			)}

			{hasNoData ? (
				<section className="bg-slate-900/40 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-16 text-center backdrop-blur-sm animate-in zoom-in-95 duration-500 flex flex-col items-center relative group">
					<div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
					<div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
						<Star className="text-emerald-400 fill-emerald-500/10" size={32} />
					</div>
					<h2 className="text-3xl font-extrabold text-white mb-3 z-10 relative">Welcome! Let&apos;s start managing your finances 🚀</h2>
					<p className="text-slate-400 max-w-lg mx-auto mb-10 font-medium text-[15px] leading-relaxed z-10 relative">
						Start by adding your first expense or setting your first savings goal. FinMentor is here to help!
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-md mx-auto z-10 relative">
						<div className="flex-1 relative shadow-emerald-500/10 shadow-2xl rounded-xl">
							<AddExpenseModal />
						</div>
						<div className="flex-1 relative shadow-amber-500/10 shadow-2xl rounded-xl">
							<AddGoalModal />
						</div>
					</div>
				</section>
			) : (
				<>
					{/* KPI CARDS: Dark Slate Theme */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm hover:border-slate-700/50 transition-colors">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
								<h3 className="text-3xl font-bold text-white mb-2">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
							</div>
							<div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
								<IndianRupee size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm hover:border-slate-700/50 transition-colors">
							<div>
								<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transactions</p>
								<h3 className="text-3xl font-bold text-white mb-2">{totalTransactions}</h3>
							</div>
							<div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner">
								<Activity size={24} />
							</div>
						</div>

						<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex flex-col justify-center items-center backdrop-blur-sm hover:bg-slate-900/80 transition-all group cursor-pointer overflow-hidden relative">
							<div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
							<Link
								href="/expenses"
								className="text-blue-400 group-hover:text-blue-300 font-bold flex items-center gap-2 transition-colors z-10 w-full h-full justify-center"
							>
								View all records{' '}
								<ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
							</Link>
						</div>
					</div>

					<DashboardCharts expenses={expenses} />

					{/* RECENT TRANSACTIONS: Dark List */}
					<div className="mt-8 bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 overflow-hidden backdrop-blur-sm">
						<div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
							<h3 className="text-lg font-bold text-white">Recent Transactions</h3>
							<Link href="/expenses" className="text-blue-400 text-sm font-bold hover:underline">
								See all
							</Link>
						</div>

						<div className="divide-y divide-slate-800/40">
							{recentExpenses.length > 0 ? (
								recentExpenses.map((exp, idx) => (
									<div key={idx} className="p-4 px-8 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
										<div className="flex flex-col">
											<span className="font-bold text-slate-100">{exp.category}</span>
											<span className="text-xs font-medium text-slate-500 mt-0.5 italic">
												{exp.note || 'No description'} &bull;{' '}
												{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
											</span>
										</div>
										<span className="font-extrabold text-white">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
									</div>
								))
							) : (
								<div className="p-16 text-center text-slate-500 flex flex-col items-center">
									<Activity className="w-12 h-12 text-slate-700 mb-4 opacity-50" />
									<p className="font-bold text-lg text-slate-300">Start tracking your expenses</p>
									<p className="font-medium italic text-sm mt-1 mb-6">Record your first coffee or grocery run! ☕</p>
									<AddExpenseModal />
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
