'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddExpenseModal() {
	const [isOpen, setIsOpen] = useState(false)
	const [amount, setAmount] = useState('')
	const [category, setCategory] = useState('Food')
	const [note, setNote] = useState('')
	const [date, setDate] = useState(new Date().toISOString().split('T')[0])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	// UPDATED: Changed bg-black to bg-white and text-white to text-black
	const inputClasses =
		'w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 font-medium'

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/add-expense', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount, category, note, date }),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to add expense')

			setIsOpen(false)
			setAmount('')
			setCategory('Food')
			setNote('')
			setDate(new Date().toISOString().split('T')[0])
			router.refresh()
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="bg-gray-900 hover:bg-black text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[44px]"
			>
				<Plus size={20} />
				Add Expense
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
						>
							<X size={20} />
						</button>

						<h2 className="text-xl font-bold text-gray-800 mb-6">Add Expense</h2>

						{error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
								<input
									type="number"
									step="0.01"
									required
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className={inputClasses}
									placeholder="₹0.00"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
								<select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
									{/* UPDATED: Removed bg-black/text-white from options */}
									<option>Food</option>
									<option>Travel</option>
									<option>Shopping</option>
									<option>Subscriptions</option>
									<option>Bills</option>
									<option>Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
								<input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClasses} />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
								<input
									type="text"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className={inputClasses}
									placeholder="Optional details"
								/>
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="w-full md:w-auto min-h-[44px] px-4 py-2 font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="w-full md:w-auto min-h-[44px] px-4 py-2 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
								>
									{loading ? 'Adding...' : 'Add Expense'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
