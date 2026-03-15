"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

export default function GoalSavingsChart({ savings }: { savings: any[] }) {
  if (!savings || savings.length === 0) return null;

  // Process data for the chart natively to create cumulative points
  // savings are ordered descending initially, but we want ascending for chart chronological history
  const sortedSavings = [...savings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  let cumulative = 0;
  
  const dataMap: { [key: string]: number } = {};
  
  sortedSavings.forEach(entry => {
     // Format to just MM/dd layout visually
     const dateStr = format(new Date(entry.created_at), "MMM dd");
     cumulative += Number(entry.amount);
     // It overwrites if multiple inputs were enacted on exact same day safely tracking the total amount mapped by the end of day
     dataMap[dateStr] = cumulative;
  });

  const chartData = Object.keys(dataMap).map(date => ({
     date,
     amount: dataMap[date]
  }));

  return (
     <div className="w-full h-48 mt-6">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Savings Progress Graph</p>
        <ResponsiveContainer width="100%" height="100%">
           <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
             <XAxis 
               dataKey="date" 
               axisLine={false} 
               tickLine={false} 
               tick={{ fill: '#6B7280', fontSize: 12 }} 
               dy={10} 
             />
             <YAxis 
               axisLine={false} 
               tickLine={false} 
               tick={{ fill: '#6B7280', fontSize: 12 }} 
               tickFormatter={(value) => `₹${value}`}
             />
             <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                formatter={(value: number) => [`₹${value}`, 'Cumulative Saved']}
             />
             <Line 
               type="monotone" 
               dataKey="amount" 
               stroke="#2563EB" 
               strokeWidth={2}
               dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
               activeDot={{ r: 6 }} 
               animationDuration={1500}
             />
           </LineChart>
        </ResponsiveContainer>
     </div>
  );
}
