"use client";

import { useState } from "react";
import { Plus, Target, CheckCircle2 } from "lucide-react";

export default function GoalsPage() {
  const [goals] = useState([
    { id: 1, name: "Emergency Fund", target: 5000, saved: 1500, deadline: "2026-12-31" },
    { id: 2, name: "New Laptop", target: 1200, saved: 800, deadline: "2026-08-15" },
  ]);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Savings Goals</h1>
          <p className="text-gray-500 mt-1">Track your progress towards your financial objectives.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
           const percent = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
           return (
             <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                       <Target size={20} />
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900">{goal.name}</h3>
                       <p className="text-xs text-gray-500">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                     </div>
                  </div>
                  {percent === 100 && <CheckCircle2 className="text-green-500" size={24} />}
               </div>
               
               <div className="mt-auto pt-4">
                 <div className="flex justify-between text-sm mb-2">
                   <span className="font-medium text-gray-700">${goal.saved.toLocaleString()}</span>
                   <span className="text-gray-500">of ${goal.target.toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                 </div>
                 <p className="text-right text-xs font-semibold text-blue-600 mt-2">{percent}% reached</p>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
