import { AlertCircle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AddExpenseModal from '@/components/AddExpenseModal'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'

export const revalidate = 0 // Ensures the page always fetches fresh data

export default async function ExpensesPage() {
	// 1. Check Configuration
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
	const hasSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_public_key'
	const isMissingSupabase = !hasSupabaseUrl || !hasSupabaseKey

	let expenses: any[] = []
	let dbError = null

	// 2. Fetch Data
	if (!isMissingSupabase) {
		const supabase = await createClient()
		
		try {
			const { data: { user } } = await supabase.auth.getUser()

			if (user) {
				const { data, error } = await supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })

				if (error) {
					dbError = error.message
				} else if (data) {
					expenses = data
				}
			}
		} catch (err: any) {
			dbError = "Network connection failed. Check your Supabase URL."
			console.error("Expenses Server Fetch Error:", err)
		}
	}

	const isEmptyDatabase = expenses.length === 0 && !dbError

	return (
		<div className="animate-in fade-in duration-500 max-w-6xl mx-auto px-4">
			{/* HEADER */}
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent leading-tight">
						Expenses
					</h1>
					<p className="text-slate-400 mt-2 font-medium italic">Manage and track your financial records.</p>
				</div>
				<div className="shrink-0">
					<AddExpenseModal />
				</div>
			</header>

			{/* ERROR HANDLING */}
			{isMissingSupabase && (
				<div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-2xl p-6 mb-8 flex items-start">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 text-amber-500" />
					<div>
						<h3 className="font-bold text-amber-100">Setup Required</h3>
						<p className="mt-1 text-sm opacity-80">Configure Supabase keys in .env.local.</p>
					</div>
				</div>
			)}

			{/* TABLE SECTION */}
			<section className="bg-slate-900/50 rounded-3xl shadow-sm border border-slate-800/60 backdrop-blur-sm">
				{isEmptyDatabase ? (
					<div className="flex flex-col items-center justify-center p-20 text-center relative group">
						<div className="absolute inset-0 rounded-3xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
						<div className="bg-emerald-500/10 p-6 rounded-full mb-6 border border-emerald-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
							<Plus size={40} className="text-emerald-400" />
						</div>
						<h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight z-10 relative">No expenses yet</h3>
						<p className="text-slate-400 max-w-md mb-10 font-medium text-[15px] leading-relaxed z-10 relative">Start by adding your first expense below.</p>
						<div className="z-10 relative shadow-emerald-500/10 shadow-2xl rounded-xl">
							<AddExpenseModal />
						</div>
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
									<th className="py-5 px-6 w-16 text-center">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-800/40">
								{expenses.map((expense) => (
									<tr key={expense.id} className="hover:bg-slate-800/30 transition-colors group">
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
											₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
										</td>
										<td className="py-5 px-6 text-center">
											<DeleteExpenseButton id={expense.id} />
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
