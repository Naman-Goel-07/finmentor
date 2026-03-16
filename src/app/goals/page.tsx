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
        <div>
            {/* ✅ FIXED HEADER: Symmetrical layout with Title on left and Button on right */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent leading-tight">
                        Savings Goals
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Track your progress towards your financial objectives.</p>
                </div>

                {/* ✅ ADD GOAL MODAL RETURNED */}
                <div className="shrink-0">
                    <AddGoalModal />
                </div>
            </header>

            {dbError && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
                    <AlertCircle className="w-6 h-6 mr-4 text-red-600 shrink-0" />
                    <p className="font-semibold">{dbError}</p>
                </div>
            )}

            {isEmptyDatabase && (
                <section className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-100 p-16 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target className="text-amber-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No goals yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-8">
                        Set your first savings target—whether it's for a new gadget, a trip, or an emergency fund.
                    </p>
                    <AddGoalModal />
                </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal}