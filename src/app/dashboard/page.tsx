import supabase from '@/lib/supabaseClient'
import DashboardCharts from '@/components/DashboardCharts'
import { AlertCircle, ArrowUpRight, IndianRupee, Activity, Plus } from 'lucide-react'
import Link from 'next/link'
import AddExpenseModal from '@/components/AddExpenseModal'

export const revalidate = 0

export default async function DashboardPage() {
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

	let expenses: any[] = []
	let dbError = null

	if (hasSupabaseUrl) {
		const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })

		if (error) {
			dbError = error.message
		} else if (data) {
			expenses = data
		}
	}

	const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
	const totalTransactions = expenses.length
	const recentExpenses = expenses.slice(0, 5)

	return (
		<div>
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
						Dashboard Overview
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic">Here&apos;s what&apos;s happening with your money.</p>
				</div>
				<AddExpenseModal />
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

			{/* ✅ KPI CARDS: Dark Slate Theme */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
					<div>
						<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
						<h3 className="text-3xl font-bold text-white">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
					</div>
					<div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
						<IndianRupee size={24} />
					</div>
				</div>

				<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex items-start justify-between backdrop-blur-sm">
					<div>
						<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Transactions</p>
						<h3 className="text-3xl font-bold text-white">{totalTransactions}</h3>
					</div>
					<div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20">
						<Activity size={24} />
					</div>
				</div>

				<div className="bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-800/60 flex flex-col justify-center items-center backdrop-blur-sm hover:bg-slate-900/80 transition-all group">
					<Link href="/expenses" className="text-blue-400 group-hover:text-blue-300 font-bold flex items-center gap-2 transition-colors">
						View all records <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
					</Link>
				</div>
			</div>

			<DashboardCharts expenses={expenses} />

			{/* ✅ RECENT TRANSACTIONS: Dark List */}
			<div className="mt-8 bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 overflow-hidden backdrop-blur-sm">
				<div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
					<h3 className="text-lg font-bold text-white">Recent Transactions</h3>
					<Link href="/expenses" className="text-blue-400 text-sm font-bold hover:underline">
						See all
					</Link>
				</div>

				<div>
					{recentExpenses.length > 0 ? (
						<div className="divide-y divide-slate-800/40">
							{recentExpenses.map((exp, idx) => (
								<div key={idx} className="p-4 px-8 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
									<div className="flex flex-col">
										<span className="font-bold text-slate-100">{exp.category}</span>
										<span className="text-xs font-medium text-slate-500 mt-0.5">
											{exp.note || 'No description'} &bull;{' '}
											{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
										</span>
									</div>
									<span className="font-extrabold text-white">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
								</div>
							))}
						</div>
					) : (
						<div className="p-12 text-center text-slate-500 font-medium">No transactions recorded yet.</div>
					)}
				</div>
			</div>
		</div>
	)
}
