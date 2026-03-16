import supabase from '@/lib/supabaseClient'
import DashboardCharts from '@/components/DashboardCharts'
import { AlertCircle, ArrowUpRight, IndianRupee, Activity } from 'lucide-react'
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
		<div className="max-w-6xl mx-auto w-full px-4 py-8">
			<header className="mb-8 flex justify-between items-center break-words">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						Dashboard Overview
					</h1>
					<p className="text-gray-500 mt-1 font-medium">Here&apos;s what&apos;s happening with your money.</p>
				</div>
				<AddExpenseModal />
			</header>

			{dbError && (
				<div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-red-600" />
					<div>
						<h3 className="font-semibold text-red-900">Database Error</h3>
						<p className="mt-1 text-sm">{dbError}</p>
					</div>
				</div>
			)}

			{/* KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
						<h3 className="text-3xl font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
					</div>
					<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
						<IndianRupee size={24} />
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 mb-1">Transactions</p>
						<h3 className="text-3xl font-bold text-gray-900">{totalTransactions}</h3>
					</div>
					<div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
						<Activity size={24} />
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
					<Link href="/expenses" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
						View all expenses <ArrowUpRight size={18} />
					</Link>
				</div>
			</div>

			<DashboardCharts expenses={expenses} />

			{/* Recent Expenses List */}
			<div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				<div className="p-6 border-b border-gray-100 flex justify-between items-center">
					<h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
					<Link href="/expenses" className="text-blue-600 text-sm font-medium">
						See all
					</Link>
				</div>

				<div className="p-0">
					{recentExpenses.length > 0 ? (
						<div className="divide-y divide-gray-50">
							{recentExpenses.map((exp, idx) => (
								<div key={idx} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
									<div className="flex flex-col">
										<span className="font-medium text-gray-900">{exp.category}</span>
										<span className="text-sm text-gray-500">
											{exp.note || 'No description'} &bull; {new Date(exp.date).toLocaleDateString()}
										</span>
									</div>
									<span className="font-bold text-gray-900">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
								</div>
							))}
						</div>
					) : (
						<div className="p-8 text-center text-gray-500">No transactions recorded yet.</div>
					)}
				</div>
			</div>
		</div>
	)
}
