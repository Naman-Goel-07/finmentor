'use client'

import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clearCache } from '@/app/actions'

interface EditGoalProps {
	goal: {
		id: string
		goal_name: string
		target_amount: number
		deadline: string
	}
}

export default function EditGoalModal({ goal }: EditGoalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [goalName, setGoalName] = useState(goal.goal_name)
	const [targetAmount, setTargetAmount] = useState(goal.target_amount.toString())
	const [deadline, setDeadline] = useState(goal.deadline)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const router = useRouter()

	const inputClasses =
		'w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400 font-medium'

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const res = await fetch('/api/edit-goal', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: goal.id,
					goal_name: goalName,
					target_amount: targetAmount,
					deadline,
				}),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to update goal')

			setIsOpen(false)
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
			{/* UPDATED TRIGGER: Now matches the Archive/Delete button styles in GoalCard */}
			<button
				onClick={() => setIsOpen(true)}
				className="flex-1 py-2 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 flex justify-center items-center gap-2 transition-all active:scale-95 cursor-pointer"
			>
				<Pencil size={14} />
				Edit
			</button>

			{isOpen && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-md p-4">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200 text-left">
						<button onClick={() => setIsOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 transition-colors p-2">
							<X size={20} />
						</button>

						<h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Edit Goal</h2>

						{error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold">{error}</div>}

						<form onSubmit={handleUpdate} className="space-y-5">
							<div>
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Goal Name</label>
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
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Amount (₹)</label>
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
								<label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Deadline</label>
								<input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClasses} />
							</div>

							<div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="w-full md:w-auto min-h-[44px] px-6 py-2 font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="w-full md:w-auto min-h-[44px] px-8 py-2 font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center"
								>
									{loading ? 'Saving...' : 'Update Goal'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
