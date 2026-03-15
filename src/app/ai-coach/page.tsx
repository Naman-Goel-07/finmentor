"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import supabase from "@/lib/supabaseClient";

export default function AICoachPage() {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    
    try {
      // Fetch user's expenses
      const { data: expenses, error: dbError } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (dbError) throw new Error("Failed to fetch expenses: " + dbError.message);
      
      if (!expenses || expenses.length === 0) {
        throw new Error("No expenses found to analyze. Please add some expenses first.");
      }

      // Call the API endpoint we created earlier
      const response = await fetch("/api/analyze-spending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ income: "Unknown", expenses })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze spending.");
      }

      setAdvice(data.advice);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Sparkles className="text-amber-500" size={32} />
          AI Coach
        </h1>
        <p className="text-gray-500 mt-1">Get personalized financial insights powered by Gemini 1.5 Flash.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-8">
         <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <Sparkles size={32} />
         </div>
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready for your financial checkup?</h2>
         <p className="text-gray-500 max-w-md mx-auto mb-6">
           Our AI will analyze your spending patterns, categorize your transactions, and provide personalized advice to help you reach your goals faster.
         </p>
         
         <button 
           onClick={handleAnalyze} 
           disabled={loading}
           className="w-full md:w-auto min-h-[44px] bg-gray-900 hover:bg-black text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mx-auto cursor-pointer"
         >
           {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
           {loading ? "Analyzing your data..." : "Analyze My Spending"}
         </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mb-8 flex items-start shadow-sm">
          <AlertCircle className="w-6 h-6 mr-4 flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Analysis Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {advice && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="text-blue-600" size={24} /> 
              Your Personalized Insights
           </h3>
           <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
             {advice}
           </div>
        </div>
      )}
    </div>
  );
}
