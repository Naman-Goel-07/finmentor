'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddGoalModal() {
	const [isOpen, setIsOpen] = useState(false)
	const [goalName, setGoalName] = useState('')
	const [targetAmount, setTargetAmount] = useState('')
	const [savedAmount, setSavedAmount] = useState('')
	const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	// ✅ SHARED STYLE: White bg, Bold Black text, Medium weight
	const inputClasses =
		'w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 font-medium'

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/add-goal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					goal_name: goalName,
					target_amount: parseFloat(targetAmount),
					saved_amount: savedAmount ? parseFloat(savedAmount) : 0,
					deadline,
				}),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to add goal')

			setIsOpen(false)
			setGoalName('')
			setTargetAmount('')
			setSavedAmount('')
			setDeadline(new Date().toISOString().split('T')[0])

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
				className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
			>
				<Plus size={20} />
				New Goal
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
						<button
							onClick={() => setIsOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
						>
							<X size={20} />
						</button>

						<h2 className="text-xl font-bold text-gray-800 mb-6">Add New Goal</h2>

						{error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">{error}</div>}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
								<input
									type="text"
									required
									value={goalName}
									onChange={(e) => setGoalName(e.target.value)}
									className={inputClasses}
									placeholder="e.g., Emergency Fund"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
								<input
									type="number"
									step="0.01"
									required
									value={targetAmount}
									onChange={(e) => setTargetAmount(e.target.value)}
									className={inputClasses}
									placeholder="₹0.00"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Initial Saved Amount (₹)</label>
								<input
									type="number"
									step="0.01"
									value={savedAmount}
									onChange={(e) => setSavedAmount(e.target.value)}
									className={inputClasses}
									placeholder="₹0.00"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
								<input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClasses} />
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="w-full md:w-auto px-4 py-2 min-h-[44px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="w-full md:w-auto px-4 py-2 min-h-[44px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
								>
									{loading ? 'Saving...' : 'Save Goal'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
