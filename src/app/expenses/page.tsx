import { AlertCircle, Plus, Info } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import AddExpenseModal from '@/components/AddExpenseModal'

export const revalidate = 0

export default async function ExpensesPage() {
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
	const hasSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_public_key'

	const isMissingSupabase = !hasSupabaseUrl || !hasSupabaseKey

	let expenses: any[] = []
	let dbError = null

	if (!isMissingSupabase) {
		const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false })

		if (error) {
			dbError = error.message
		} else if (data) {
			expenses = data
		}
	}

	const isEmptyDatabase = expenses.length === 0 && !dbError

	return (
		<div className="animate-in fade-in duration-500">
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
						Expenses
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic">Manage and track your financial records.</p>
				</div>
				<AddExpenseModal />
			</header>

			{/* ERROR STATES: Updated for Dark Theme */}
			{isMissingSupabase && (
				<div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-amber-500" />
					<div>
						<h3 className="font-bold text-amber-100">Setup Required</h3>
						<p className="mt-1 text-sm opacity-80">
							Please configure Supabase API keys in <code className="bg-slate-800 px-1 rounded">.env.local</code>.
						</p>
					</div>
				</div>
			)}

			{dbError && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5" />
					<div>
						<h3 className="font-bold text-red-200">Database Error</h3>
						<p className="mt-1 text-sm opacity-80">{dbError}</p>
					</div>
				</div>
			)}

			{/* ✅ TABLE SECTION: Dark Glass Style */}
			<section className="bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 overflow-hidden backdrop-blur-sm">
				{isEmptyDatabase ? (
					<div className="flex flex-col items-center justify-center p-20 text-center">
						<div className="bg-slate-800 p-6 rounded-full mb-6">
							<Plus size={40} className="text-slate-500" />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">No expenses yet</h3>
						<p className="text-slate-400 max-w-sm mb-8 font-medium">Your database is empty. Add your first transaction to see it here.</p>
						<AddExpenseModal />
					</div>
				) : (
					<div className="overflow-x-auto w-full">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="border-b border-slate-800/60 bg-slate-800/30 text-slate-400 text-xs uppercase tracking-widest font-bold">
									<th className="py-5 px-8">Date</th>
									<th className="py-5 px-8">Category</th>
									<th className="py-5 px-8">Note</th>
									<th className="py-5 px-8 text-right">Amount</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800/40">
								{expenses.map((expense, index) => (
									<tr key={expense.id || `expense-${index}`} className="hover:bg-slate-800/30 transition-colors group">
										<td className="py-5 px-8 text-slate-300 font-medium whitespace-nowrap">
											{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
										</td>
										<td className="py-5 px-8">
											<span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
												{expense.category}
											</span>
										</td>
										<td className="py-5 px-8 text-slate-400 font-medium italic">{expense.note || 'No description'}</td>
										<td className="py-5 px-8 text-right font-bold text-white text-lg">
											₹
											{expense.amount.toLocaleString('en-IN', {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	)
}
