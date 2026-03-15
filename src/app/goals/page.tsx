import supabase from "@/lib/supabaseClient";
import AddGoalModal from "@/components/AddGoalModal";
import GoalCard from "@/components/GoalCard";
import { AlertCircle, Target } from "lucide-react";

export const revalidate = 0;

export default async function GoalsPage() {
  const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url';
  
  let goals: any[] = [];
  let dbError = null;

  if (hasSupabaseUrl) {
    const { data: goalsData, error: goalsError } = await supabase
      .from("goals")
      .select("*")
      .order("deadline", { ascending: true });

    if (goalsError) {
      dbError = goalsError.message;
    } else if (goalsData) {
      // Filter out archived goals locally to avoid crashing if column is missing
      goals = goalsData.filter((g: any) => g.is_archived !== true);
      
      try {
         // Attempt to fetch savings safely (will fail gracefully if you haven't created the table yet)
         const { data: savingsData, error: savingsError } = await supabase
           .from("goal_savings")
           .select("*")
           .order("created_at", { ascending: false });
           
         if (!savingsError && savingsData) {
            goals = goals.map(g => ({
              ...g,
              goal_savings: savingsData.filter(s => s.goal_id === g.id)
            }));
         }
      } catch (e) {
         // ignore table missing errors and proceed
      }
    }
  }

  const isEmptyDatabase = goals.length === 0 && !dbError;

  return (
    <div className="max-w-5xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Savings Goals</h1>
          <p className="text-gray-500 mt-1">Track your progress towards your financial objectives.</p>
        </div>
        <AddGoalModal />
      </header>

      {!hasSupabaseUrl && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-900">Setup Required</h3>
            <p className="mt-1 text-sm">
              Please configure Supabase API keys in <code>.env.local</code> to store your goals tracking data.
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

      {isEmptyDatabase && hasSupabaseUrl && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col items-center justify-center p-16 text-center h-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 m-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No goals yet</h3>
            <p className="text-gray-500 max-w-md">
              Your database is connected but there are no active savings goals. Start by adding an emergency fund or laptop savings target to track your progress!
            </p>
          </div>
        </section>
      )}

      {goals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

    </div>
  );
}
