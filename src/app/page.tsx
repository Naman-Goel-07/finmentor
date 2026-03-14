import { AlertCircle, Plus } from "lucide-react";

export default function Home() {
  // Mock validation flags for beginner friendly error handling
  // Normally you'd want to check process.env or fetch from a config
  const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url';
  const hasSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_public_key';
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';
  
  const isMissingEnvVars = !hasSupabaseUrl || !hasSupabaseKey || !hasOpenAIKey;

  // Mock state: For when you connect to a DB but there are no expenses yet
  const expenses: any[] = [];
  const isEmptyDatabase = expenses.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8 font-sans">
      <main className="max-w-4xl mx-auto w-full flex-grow">
        
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Finmentor AI
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Your intelligent expense and finance tracker.</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <Plus size={20} />
            Add Expense
          </button>
        </header>

        {isMissingEnvVars && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
            <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-lg text-amber-900">Setup Required</h3>
              <p className="mt-1">
                It looks like you are missing some environment variables. Please update your <code>.env.local</code> file with your real API keys for Supabase and OpenAI to unlock full functionality.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Area */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Overview</h2>

          {isEmptyDatabase ? (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Plus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No expenses yet</h3>
              <p className="text-gray-500 max-w-md">
                Your database is connected but we couldn't find any financial records. Start by adding a new expense to see your AI-powered insights.
              </p>
            </div>
          ) : (
            <div>
              {/* Content when expenses exist goes here */}
              <p className="text-gray-600">Your expense data will appear here.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
