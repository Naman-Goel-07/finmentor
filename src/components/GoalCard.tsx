'use client'

import { useState } from 'react'
import { Target, Loader2, ChevronDown, ChevronUp, Archive, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { format } from 'date-fns'
import AddSavingModal from './AddSavingModal'
import DeleteContributionButton from './DeleteContributionButton'
import GoalSavingsChart from './GoalSavingsChart'

export default function GoalCard({ goal }: { goal: any }) {
	const router = useRouter()
	const [loadingAction, setLoadingAction] = useState<number | string | null>(null)
	const [errorAmount, setErrorAmount] = useState<string | null>(null)
	const [expanded, setExpanded] = useState(false)
	const [showSavingModal, setShowSavingModal] = useState(false)

	// ✅ THE NUDGE: Forces child components to re-calculate cumulative logic
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	// ✅ THE DYNAMIC TRUTH: Calculate total from history, not the stale database column
	const savingsHistory = goal.goal_savings || []
	const dynamicTotalSaved = savingsHistory.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0)

	// Use the dynamic total for all calculations to ensure instant slider response
	const percent = goal.target_amount > 0 ? Math.min(Math.round((dynamicTotalSaved / goal.target_amount) * 100), 100) : 0
	const remaining = Math.max(goal.target_amount - dynamicTotalSaved, 0)
	const isCompleted = dynamicTotalSaved >= goal.target_amount

	// Status and Deadline calculation
	const rawDaysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
	const daysRemaining = Math.max(rawDaysRemaining, 0)

	let statusText = 'On Track'
	let statusColor = 'bg-blue-100 text-blue-800'
	let deadlineText = `${daysRemaining} days remaining`

	if (isCompleted) {
		statusText = 'Completed'
		statusColor = 'bg-green-100 text-green-800'
		deadlineText = 'Goal Reached!'
	} else if (rawDaysRemaining < 0) {
		statusText = 'Expired'
		statusColor = 'bg-red-100 text-red-800'
		deadlineText = 'Deadline passed'
	} else if (daysRemaining < 30 && percent < 80) {
		statusText = 'Behind'
		statusColor = 'bg-amber-100 text-amber-800'
	}

	const smartSuggestion = !isCompleted && daysRemaining > 0 && remaining > 0 ? Math.ceil(remaining / daysRemaining) : 0

	// ✅ HANDLER: Clears cache and triggers Next.js re-fetch
	const handleManualRefresh = () => {
		setRefreshTrigger((prev) => prev + 1)
		router.refresh()
	}

	const handleQuickSave = async (amount: number) => {
		setLoadingAction(amount)
		setErrorAmount(null)
		try {
			const res = await fetch('/api/update-goal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: goal.id, amountToAdd: amount }),
			})
			if (!res.ok) throw new Error('Update failed')
			handleManualRefresh()
		} catch (err: any) {
			setErrorAmount('Failed to update.')
		} finally {
			setLoadingAction(null)
		}
	}

	const handleGoalAction = async (action: 'archive' | 'delete') => {
		if (action === 'delete' && !confirm('Delete this entire goal? History will be lost!')) return

		setLoadingAction(action)
		try {
			const res = await fetch(`/api/${action}-goal`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: goal.id }),
			})
			if (!res.ok) throw new Error(`${action} failed`)
			router.refresh()
		} catch (err: any) {
			setErrorAmount(`Failed to ${action} goal.`)
		} finally {
			setLoadingAction(null)
		}
	}

	return (
		<>
			{showSavingModal && <AddSavingModal goalId={goal.id} goalName={goal.goal_name} onClose={() => setShowSavingModal(false)} />}
			<div
				className={clsx(
					'bg-white p-4 md:p-6 rounded-3xl shadow-sm border flex flex-col transition-all duration-300 w-full group',
					isCompleted ? 'border-green-200 bg-green-50/10' : 'border-gray-100',
				)}
			>
				<div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
					<div className="flex items-center gap-3">
						<div
							className={clsx(
								'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
								isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600',
							)}
						>
							<Target size={20} />
						</div>
						<div>
							<h3 className="font-bold text-gray-900 flex items-center gap-2">
								{goal.goal_name}
								<span className={clsx('text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full', statusColor)}>
									{statusText}
								</span>
							</h3>
							<p className={clsx('text-sm mt-1 font-medium', rawDaysRemaining < 0 && !isCompleted ? 'text-red-500' : 'text-gray-500')}>
								{deadlineText} <span className="font-normal text-gray-400">({format(new Date(goal.deadline), 'dd/MM')})</span>
							</p>
						</div>
					</div>
					<button className="text-gray-400 hover:text-gray-600 p-1">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
				</div>

				<div className="pt-2">
					<div className="flex justify-between text-sm mb-2 items-end">
						<div>
							{/* ✅ Dynamic savings amount */}
							<span className="text-2xl font-black text-gray-900">₹{dynamicTotalSaved.toLocaleString()}</span>
							<span className="text-gray-400 ml-1 text-xs">/ ₹{goal.target_amount.toLocaleString()}</span>
						</div>
						<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{percent}% Saved</span>
					</div>

					{/* ✅ THE SLIDER: Now responds instantly to 'percent' */}
					<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
						<div
							className={clsx('h-full rounded-full transition-all duration-1000 ease-out', isCompleted ? 'bg-green-500' : 'bg-blue-600')}
							style={{ width: `${percent}%` }}
						></div>
					</div>

					<div className="flex justify-between items-center mt-3">
						<div className="flex items-center gap-1.5">
							<div className={clsx('w-1.5 h-1.5 rounded-full', isCompleted ? 'bg-green-500' : 'bg-blue-500')} />
							<p className={clsx('text-xs font-black uppercase tracking-widest', isCompleted ? 'text-green-600' : 'text-blue-600')}>
								{isCompleted ? 'Goal Completed 🎉' : 'Progress'}
							</p>
						</div>
						{!isCompleted && smartSuggestion > 0 && (
							<p className="text-[10px] font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded shadow-sm">
								<TrendingUp size={12} /> ₹{smartSuggestion.toLocaleString()}/day
							</p>
						)}
					</div>
				</div>

				{expanded && (
					<div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
						{/* ✅ CHART: Fully synchronized with history */}
						<GoalSavingsChart savings={savingsHistory} refreshTrigger={refreshTrigger} />

						{isCompleted ? (
							<div className="flex gap-2 mb-6 mt-6">
								<button
									onClick={() => handleGoalAction('archive')}
									className="flex-1 py-2 rounded-lg text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex justify-center items-center gap-2"
								>
									<Archive size={14} /> Archive
								</button>
								<button
									onClick={() => handleGoalAction('delete')}
									className="flex-1 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex justify-center items-center gap-2"
								>
									<Trash2 size={14} /> Delete
								</button>
							</div>
						) : (
							<div className="mb-6 mt-6">
								<div className="flex justify-between items-center mb-3">
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Save</p>
									<button onClick={() => setShowSavingModal(true)} className="text-[10px] font-bold text-blue-600 hover:underline">
										Custom Amount
									</button>
								</div>
								<div className="flex gap-2">
									{[100, 500, 1000].map((amount) => (
										<button
											key={amount}
											onClick={() => handleQuickSave(amount)}
											disabled={loadingAction !== null}
											className="flex-1 py-2 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
										>
											{loadingAction === amount ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `+₹${amount}`}
										</button>
									))}
								</div>
							</div>
						)}

						<div>
							<p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">History</p>
							<div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
								{savingsHistory.length > 0 ? (
									savingsHistory.map((entry: any) => (
										<div
											key={entry.id}
											className="group/item flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-all"
										>
											<div className="flex flex-col">
												<span className="text-xs font-bold text-gray-800">{entry.note || 'Saved amount'}</span>
												<span className="text-[10px] text-gray-400 font-medium">
													{format(new Date(entry.created_at), 'dd MMM, yyyy')}
												</span>
											</div>
											<div className="flex items-center gap-3">
												<span className="text-xs font-black text-green-600">+₹{entry.amount.toLocaleString()}</span>
												{/* ✅ DELETE: Calls parent refresh to sync slider and graph */}
												<DeleteContributionButton id={entry.id} onSuccess={handleManualRefresh} />
											</div>
										</div>
									))
								) : (
									<p className="text-xs text-gray-400 italic text-center py-4">No records found.</p>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	)
}
