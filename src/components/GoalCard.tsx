"use client";

import { useState } from "react";
import { Target, CheckCircle2, Loader2, ChevronDown, ChevronUp, Archive, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { format } from "date-fns";
import AddSavingModal from "./AddSavingModal";
import GoalSavingsChart from "./GoalSavingsChart";

export default function GoalCard({ goal }: { goal: any }) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<number | string | null>(null);
  const [errorAmount, setErrorAmount] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);

  const percent = Math.min(Math.round((goal.saved_amount / goal.target_amount) * 100), 100);
  const remaining = Math.max(goal.target_amount - goal.saved_amount, 0);

  // Status calculation
  const isCompleted = goal.saved_amount >= goal.target_amount;
  const rawDaysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(rawDaysRemaining, 0);
  
  let statusText = "On Track";
  let statusColor = "bg-blue-100 text-blue-800";
  let deadlineText = `${daysRemaining} days remaining`;

  if (isCompleted) {
    statusText = "Completed";
    statusColor = "bg-green-100 text-green-800";
    deadlineText = "Goal Reached!";
  } else if (rawDaysRemaining < 0) {
    statusText = "Deadline Missed";
    statusColor = "bg-red-100 text-red-800";
    deadlineText = "Deadline has passed";
  } else if (daysRemaining > 0) {
    if (daysRemaining < 30 && percent < 80) {
      statusText = "Behind Schedule";
      statusColor = "bg-amber-100 text-amber-800";
    }
  } else if (daysRemaining === 0 && !isCompleted) {
    statusText = "Overdue";
    statusColor = "bg-red-100 text-red-800";
    deadlineText = "Ends today";
  }

  const smartSuggestion = (!isCompleted && daysRemaining > 0 && remaining > 0) 
    ? Math.ceil(remaining / daysRemaining)
    : 0;

  const handleQuickSave = async (amount: number) => {
    setLoadingAction(amount);
    setErrorAmount(null);
    try {
      const res = await fetch("/api/update-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id, amountToAdd: amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.refresh(); 
    } catch (err: any) {
      setErrorAmount("Failed to update.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoalAction = async (action: 'archive' | 'delete') => {
    setLoadingAction(action);
    setErrorAmount(null);
    try {
      const res = await fetch(`/api/${action}-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goal.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.refresh(); 
    } catch (err: any) {
      setErrorAmount(`Failed to ${action} goal.`);
    } finally {
      setLoadingAction(null);
    }
  };

  const savingsHistory = goal.goal_savings || [];

  return (
    <>
      {showSavingModal && (
        <AddSavingModal 
          goalId={goal.id} 
          goalName={goal.goal_name} 
          onClose={() => setShowSavingModal(false)} 
        />
      )}
      <div className={clsx(
        "bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col transition-all duration-300 w-full",
        isCompleted ? "border-green-200 bg-green-50/10" : "border-gray-100"
      )}>
        <div 
           className="flex justify-between items-start mb-4 cursor-pointer group"
           onClick={() => setExpanded(!expanded)}
        >
           <div className="flex items-center gap-3">
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isCompleted ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
              )}>
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  {goal.goal_name}
                  <span className={clsx("text-xs font-semibold px-2 py-0.5 rounded-full inline-block", statusColor)}>
                    {statusText}
                  </span>
                </h3>
                <p className={clsx("text-sm mt-1 font-medium", rawDaysRemaining < 0 && !isCompleted ? "text-red-500" : "text-gray-500")}>
                  {deadlineText} <span className="font-normal text-gray-400">({format(new Date(goal.deadline), "dd/MM/yyyy")})</span>
                </p>
              </div>
           </div>
           <button className="text-gray-400 group-hover:text-gray-600 transition-colors p-1">
             {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </button>
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between text-sm mb-2 items-end">
            <div>
              <span className="text-2xl font-bold text-gray-900">₹{goal.saved_amount.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">of ₹{goal.target_amount.toLocaleString()}</span>
            </div>
            <span className="text-xs font-medium text-gray-500 mb-1 leading-5">Remaining: ₹{remaining.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-2">
            <div 
               className={clsx(
                 "h-3 rounded-full transition-all duration-1000",
                 isCompleted ? "bg-green-500" : "bg-blue-600"
               )} 
               style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className={clsx(
               "text-sm font-bold flex items-center gap-1",
               isCompleted ? "text-green-600" : "text-blue-600"
            )}>
              {isCompleted ? (
                <>Goal Completed 🎉</>
              ) : (
                `${percent}% reached`
              )}
            </p>
            {!isCompleted && smartSuggestion > 0 && (
              <p className="text-xs font-medium text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded shadow-sm">
                 <TrendingUp size={14} /> Save ₹{smartSuggestion.toLocaleString()}/day
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Area */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
             
             {/* Quick Actions / Archive */}
             {isCompleted ? (
                <div className="flex gap-3 mb-6">
                   <button 
                     onClick={() => handleGoalAction('archive')} 
                     disabled={loadingAction === 'archive'}
                     className="flex-1 min-h-[44px] py-2.5 rounded-lg font-medium text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                   >
                     {loadingAction === 'archive' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive size={16} />} 
                     Archive Goal
                   </button>
                   <button 
                     onClick={() => handleGoalAction('delete')} 
                     disabled={loadingAction === 'delete'}
                     className="flex-1 min-h-[44px] py-2.5 rounded-lg font-medium text-sm md:text-base text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                   >
                     {loadingAction === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />} 
                     Delete Goal
                   </button>
                </div>
             ) : (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</p>
                     <button 
                       onClick={() => setShowSavingModal(true)}
                       className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                     >
                       Add Custom Amount
                     </button>
                  </div>
                  {errorAmount && <p className="text-xs text-red-600 mb-2">{errorAmount}</p>}
                  <div className="flex gap-2">
                    {[100, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickSave(amount)}
                        disabled={loadingAction !== null}
                        className="flex-1 min-h-[44px] py-2 rounded-lg font-medium text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer"
                      >
                        {loadingAction === amount ? <Loader2 className="w-4 h-4 animate-spin" /> : `+₹${amount}`}
                      </button>
                    ))}
                  </div>
                </div>
             )}

             {/* Savings History Timeline */}
             <div>
                <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Savings History</p>
                {savingsHistory.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {savingsHistory.map((entry: any) => (
                      <div key={entry.id} className="flex justify-between items-center text-sm p-3 rounded-lg bg-gray-50 border border-gray-100">
                         <div className="flex flex-col">
                           <span className="font-medium text-gray-800">{entry.note || "Saved amount"}</span>
                           <span className="text-xs text-gray-500">{format(new Date(entry.created_at), "dd/MM/yyyy")}</span>
                         </div>
                         <span className="font-bold text-green-600 border border-green-200 bg-green-50 px-2 py-0.5 rounded-md">
                           +₹{entry.amount.toLocaleString()}
                         </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                     <p className="text-sm text-gray-500">No savings recorded yet.</p>
                  </div>
                )}
             </div>

          </div>
        )}
      </div>
    </>
  );
}
