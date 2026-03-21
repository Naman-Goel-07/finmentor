'use client'

import { useState } from 'react'
import { Plus, X, Loader2, IndianRupee } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearCache } from '@/app/actions'

export default function AddSavingModal({ goalId, goalName, onClose }: { goalId: string; goalName: string; onClose: () => void }) {
	const [amount, setAmount] = useState('')
	const [note, setNote] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/add-goal-contribution', {
				// 1. Updated URL
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					goal_id: goalId, // 2. Updated key: goal_id
					amount: parseFloat(amount), // 3. Updated key: amount
					note: note || 'Manual Contribution',
				}),
			})

			const data = await res.json()

			if (!res.ok) {
				throw new Error(data.error || 'Failed to add saving')
			}
			await clearCache('/goals')
			router.refresh()
			onClose()
		} catch (err: any) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
				<button
					onClick={onClose}
					className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
				>
					<X size={20} />
				</button>

				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Save for {goalName}</h2>
					<p className="text-sm text-gray-500 mt-1">Great job staying consistent! Every rupee counts.</p>
				</div>

				{error && (
					<div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm flex items-center gap-2">
						<span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<label className="text-sm font-bold text-gray-700 ml-1">How much are you saving?</label>
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
								placeholder="0.00"
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
							placeholder="e.g. Skipped Starbucks coffee"
						/>
					</div>

					<div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
						<button
							type="submit"
							disabled={loading || !amount}
							className="flex-1 py-3.5 font-bold bg-gray-900 hover:bg-black text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gray-200 active:scale-95"
						>
							{loading && <Loader2 className="w-5 h-5 animate-spin" />}
							{loading ? 'Updating...' : 'Confirm Deposit'}
						</button>
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3.5 font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors cursor-pointer"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
