import { createClient } from '@/lib/supabase/server'
import AddGoalModal from '@/components/AddGoalModal'
import GoalCard from '@/components/GoalCard'
import { AlertCircle, Target, ArrowLeft, Archive } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
	const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

	// 2. Await searchParams for Next.js 15 compatibility
	const params = await searchParams
	const isArchivedView = params.view === 'archived'

	let goals: any[] = []
	let dbError = null

	if (hasSupabaseUrl) {
		const supabase = await createClient()

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser()

			if (user) {
				// 3. Fetch all goals
				const { data: goalsData, error: goalsError } = await supabase
					.from('goals')
					.select('*')
					.eq('user_id', user.id)
					.order('deadline', { ascending: true })

				if (goalsError) {
					dbError = goalsError.message
				} else {
					// Use a fallback empty array to prevent filtering errors if goalsData is null
					const allGoals = goalsData || []

					// 4. Filter goals based on the 'view' parameter
					const filteredGoals = allGoals.filter((g: any) => (isArchivedView ? g.is_archived === true : g.is_archived !== true))

					// 5. Fetch all contributions
					const { data: savingsData, error: savingsError } = await supabase
						.from('goal_contributions')
						.select('*')
						.eq('user_id', user.id)
						.order('created_at', { ascending: false })

					const allSavings = savingsData || []

					// 6. Merge data and fix the "Initial Amount" reflection
					goals = filteredGoals.map((g) => {
						const contributions = allSavings.filter((s) => s.goal_id === g.id)

						// Calculate total: saved_amount (initial) + sum of all contributions
						const totalContributionAmount = contributions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
						const totalSavedCalculated = Number(g.saved_amount || 0) + totalContributionAmount

						return {
							...g,
							goal_savings: contributions,
							total_saved_calculated: totalSavedCalculated,
						}
					})
				}
			}
		} catch (err: any) {
			dbError = 'Network connection failed. Check your Supabase URL.'
			console.error('Goals Server Fetch Error:', err)
		}
	}

	const isEmptyDatabase = goals.length === 0 && !dbError

	return (
		<div className="animate-in fade-in duration-500 max-w-6xl mx-auto px-4 py-8">
			<header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						{isArchivedView && (
							<Link href="/goals" className="p-1 hover:bg-slate-800 rounded-full transition-colors">
								<ArrowLeft className="w-5 h-5 text-slate-400" />
							</Link>
						)}
						<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent leading-tight">
							{isArchivedView ? 'Archived Goals' : 'Savings Goals'}
						</h1>
					</div>

					<div className="flex items-center gap-4 mt-2">
						<p className="text-slate-400 font-medium italic">
							{isArchivedView ? 'Your completed or paused objectives.' : 'Track your progress towards your financial objectives.'}
						</p>
						<span className="text-slate-700">|</span>
						<Link
							href={isArchivedView ? '/goals' : '/goals?view=archived'}
							className="text-sm font-semibold text-amber-500/80 hover:text-amber-400 flex items-center gap-1 transition-colors"
						>
							{isArchivedView ? (
								'Back to Active'
							) : (
								<>
									<Archive size={14} />
									View Archive
								</>
							)}
						</Link>
					</div>
				</div>
				{!isArchivedView && (
					<div className="shrink-0">
						<AddGoalModal />
					</div>
				)}
			</header>

			{/* Error State */}
			{dbError && (
				<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
					<AlertCircle className="w-6 h-6 mr-4 text-red-600 shrink-0" />
					<div>
						<h3 className="font-bold text-red-200">Database Error</h3>
						<p className="mt-1 text-sm opacity-80">{dbError}</p>
					</div>
				</div>
			)}

			{/* Empty State */}
			{isEmptyDatabase ? (
				<section className="bg-slate-900/50 rounded-3xl shadow-sm border-2 border-dashed border-slate-700/60 p-12 md:p-20 text-center backdrop-blur-sm relative group animate-in zoom-in-95 duration-500">
					<div className="absolute inset-0 rounded-3xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
					<div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-inner z-10 relative transition-transform group-hover:scale-110 duration-500">
						<Target className="text-amber-400 drop-shadow-lg" size={48} />
					</div>
					<h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight z-10 relative">
						{isArchivedView ? 'Clean slate! 🗃️' : "You haven't created any goals yet"}
					</h3>
					<p className="text-slate-400 max-w-md mx-auto mb-10 font-medium text-[15px] leading-relaxed z-10 relative">
						{isArchivedView
							? 'You have no archived goals yet. Focus on crushing your active objectives and watch your financial profile grow!'
							: 'Break down your financial dreams into achievable milestones. Set your first savings target below.'}
					</p>
					{!isArchivedView && (
						<div className="z-10 relative shadow-amber-500/10 shadow-2xl rounded-xl inline-block">
							<AddGoalModal />
						</div>
					)}
				</section>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
					{goals.map((goal) => (
						<GoalCard key={goal.id} goal={goal} />
					))}
				</div>
			)}
		</div>
	)
}
