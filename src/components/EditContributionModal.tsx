'use client'

import { useState } from 'react'
import { X, Loader2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearCache } from '@/app/actions'

interface EditContributionModalProps {
	contribution: {
		id: string
		amount: number
		note: string | null
	}
	goalName: string
}

export default function EditContributionModal({ contribution, goalName }: EditContributionModalProps) {
	const [isOpen, setIsOpen] = useState(false) // Handle open/close internally
	const [amount, setAmount] = useState(contribution.amount.toString())
	const [note, setNote] = useState(contribution.note || '')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/edit-goal-contribution', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: contribution.id,
					amount: parseFloat(amount),
					note: note || 'Updated Contribution',
				}),
			})

			const data = await res.json()

			if (!res.ok) throw new Error(data.error || 'Failed to update contribution')

			setIsOpen(false) // Close internally on success
			await clearCache('/goals')
			router.refresh()
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			{/* TRIGGER BUTTON: The Pencil icon inside the history row */}
			<button onClick={() => setIsOpen(true)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all cursor-pointer">
				<Pencil size={12} />
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200 text-left">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
						>
							<X size={20} />
						</button>

						<div className="mb-6">
							<h2 className="text-2xl font-bold text-gray-900">Edit Contribution</h2>
							<p className="text-sm text-gray-500 mt-1">
								Adjusting contribution for <strong>{goalName}</strong>.
							</p>
						</div>

						{error && (
							<div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm flex items-center gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<label className="text-sm font-bold text-gray-700 ml-1">Update Amount (₹)</label>
								<div className="relative">
									<span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
									<input
										type="number"
										step="0.01"
										required
										autoFocus
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-lg font-semibold text-gray-900"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-bold text-gray-700 ml-1">Note (Optional)</label>
								<input
									type="text"
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
									placeholder="e.g. Adjusted manual contribution"
								/>
							</div>

							<div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
								<button
									type="submit"
									disabled={loading || !amount}
									className="flex-1 py-3.5 font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
								>
									{loading && <Loader2 className="w-5 h-5 animate-spin" />}
									{loading ? 'Updating...' : 'Update Contribution'}
								</button>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="flex-1 py-3.5 font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
