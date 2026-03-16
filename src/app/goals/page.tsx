import supabase from '@/lib/supabaseClient'
import AddGoalModal from '@/components/AddGoalModal'
import GoalCard from '@/components/GoalCard'
import { AlertCircle, Target } from 'lucide-react'

export const revalidate = 0

export default async function GoalsPage() {
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

	let goals: any[] = []
	let dbError = null

	if (hasSupabaseUrl) {
		const { data: goalsData, error: goalsError } = await supabase.from('goals').select('*').order('deadline', { ascending: true })

		if (goalsError) {
			dbError = goalsError.message
		} else if (goalsData) {
			const activeGoals = goalsData.filter((g: any) => g.is_archived !== true)

			try {
				const { data: savingsData, error: savingsError } = await supabase
					.from('goal_contributions')
					.select('*')
					.order('created_at', { ascending: false })

				if (!savingsError && savingsData) {
					// Keep the key as 'goal_savings' because your GoalCard expects that name
					goals = activeGoals.map((g) => ({
						...g,
						goal_savings: savingsData.filter((s) => s.goal_id === g.id),
					}))
				} else {
					goals = activeGoals
				}
			} catch (e) {
				goals = activeGoals
			}
		}
	}

	const isEmptyDatabase = goals.length === 0 && !dbError

	return (
		<div className="max-w-5xl mx-auto w-full px-4 py-8">
			<header className="mb-8 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">Savings Goals</h1>
					<p className="text-gray-500 mt-1">Track your progress towards your financial objectives.</p>
				</div>
				<AddGoalModal />
			</header>

			{dbError && (
				<div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-8 flex items-start">
					<AlertCircle className="w-6 h-6 mr-4 text-red-600" />
					<p className="font-semibold">{dbError}</p>
				</div>
			)}

			{isEmptyDatabase && (
				<section className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-12 text-center">
					<Target className="mx-auto text-gray-400 mb-4" size={48} />
					<h3 className="text-xl font-bold text-gray-700">No goals yet</h3>
					<p className="text-gray-500">Start your first savings target to see your history here!</p>
				</section>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{goals.map((goal) => (
					<GoalCard key={goal.id} goal={goal} />
				))}
			</div>
		</div>
	)
}
