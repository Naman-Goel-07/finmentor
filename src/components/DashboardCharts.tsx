"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function DashboardCharts({ expenses }: { expenses: any[] }) {
  // Aggregate category spending
  const categoryMap: Record<string, number> = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  
  const pieData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  })).sort((a,b) => b.value - a.value);

  // Aggregate monthly spending
  const monthMap: Record<string, number> = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    const month = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthMap[month] = (monthMap[month] || 0) + e.amount;
  });

  const barData = Object.keys(monthMap).map(key => ({
    name: key,
    Total: monthMap[key]
  })).reverse(); // simple chronological sort if expenses are descending by date

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Category</h3>
        <div className="h-72">
          {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No expenses yet</div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Spending</h3>
        <div className="h-72">
          {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `$${value}`} />
              <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No expenses yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
