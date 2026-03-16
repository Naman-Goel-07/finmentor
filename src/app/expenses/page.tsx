import { AlertCircle, Plus, Info } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import AddExpenseModal from '@/components/AddExpenseModal'

export const revalidate = 0 // Ensure data is fetched fresh

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
		<div>
			<header className="mb-8 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
						Expenses
					</h1>
					<p className="text-gray-500 mt-1 font-medium">Manage and track your financial records.</p>
				</div>
				<AddExpenseModal />
			</header>

			{isMissingSupabase && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-amber-600" />
					<div>
						<h3 className="font-semibold text-amber-900">Setup Required</h3>
						<p className="mt-1 text-sm">
							Please configure Supabase API keys in <code>.env.local</code> to store expenses.
						</p>
					</div>
				</div>
			)}

			{dbError && (
				<div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
					<AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-red-600" />
					<div>
						<h3 className="font-semibold text-red-900">Database Error</h3>
						<p className="mt-1 text-sm">{dbError}</p>
					</div>
				</div>
			)}

			<section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
				{isEmptyDatabase ? (
					<div className="flex flex-col items-center justify-center p-16 text-center h-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 m-4">
						<div className="bg-gray-100 p-4 rounded-full mb-4">
							<Plus size={32} className="text-gray-400" />
						</div>
						<h3 className="text-xl font-bold text-gray-700 mb-2">No expenses yet</h3>
						<p className="text-gray-500 max-w-md">Your database is connected but there are no records. Start by adding a new expense.</p>
					</div>
				) : (
					<div className="overflow-x-auto w-full pb-4">
						{expenses.length > 0 ? (
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-sm">
										<th className="py-4 px-6 font-medium">Date</th>
										<th className="py-4 px-6 font-medium">Category</th>
										<th className="py-4 px-6 font-medium">Note</th>
										<th className="py-4 px-6 font-medium text-right">Amount</th>
									</tr>
								</thead>
								<tbody>
									{expenses.map((expense, index) => (
										<tr key={expense.id || `expense-${index}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
											<td className="py-4 px-6 text-gray-900 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
											<td className="py-4 px-6">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													{expense.category}
												</span>
											</td>
											<td className="py-4 px-6 text-gray-500">{expense.note || <span className="italic text-gray-400">No note</span>}</td>
											{/* ✅ UPDATED: Changed $ to ₹ and added en-IN formatting with decimals */}
											<td className="py-4 px-6 text-right font-medium text-gray-900">
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
						) : null}
					</div>
				)}
			</section>
		</div>
	)
}
