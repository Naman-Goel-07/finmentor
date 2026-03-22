'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

export default function DashboardCharts({ expenses }: { expenses: any[] }) {
	const [view, setView] = useState<'daily' | 'monthly'>('daily')

	// --- 0. Helper: Get all unique categories ---
	const allCategories = Array.from(new Set(expenses.map((e) => e.category)))

	// --- 1. Category Logic (Pie Chart) ---
	const categoryMap: Record<string, number> = {}
	expenses.forEach((e) => {
		categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
	})
	const pieData = Object.keys(categoryMap)
		.map((key) => ({ name: key, value: categoryMap[key] }))
		.sort((a, b) => b.value - a.value)

	// --- 2. Daily Aggregation (Stacked) ---
	const last7DaysStrings = [...Array(7)]
		.map((_, i) => {
			const d = new Date()
			d.setDate(d.getDate() - i)
			return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
		})
		.reverse()

	const dailyData = last7DaysStrings.map((dayStr) => {
		const dayObj: any = { name: dayStr }
		// Initialize all categories to 0 for this day
		allCategories.forEach((cat) => (dayObj[cat] = 0))

		// Fill with actual data
		expenses.forEach((e) => {
			const eDay = new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
			if (eDay === dayStr) {
				dayObj[e.category] += e.amount
			}
		})
		return dayObj
	})

	// --- 3. Monthly Aggregation (Stacked) ---
	const monthMap: Record<string, any> = {}
	expenses.forEach((e) => {
		const d = new Date(e.date)
		const month = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })

		if (!monthMap[month]) {
			monthMap[month] = { name: month }
			allCategories.forEach((cat) => (monthMap[month][cat] = 0))
		}
		monthMap[month][e.category] += e.amount
	})

	const monthlyData = Object.values(monthMap).sort((a: any, b: any) => {
		return new Date(a.name).getTime() - new Date(b.name).getTime()
	})

	const activeData = view === 'daily' ? dailyData : monthlyData

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
			{/* Category Pie Chart */}
			<div className="bg-slate-900/50 p-4 md:p-6 rounded-3xl border border-slate-800/60 backdrop-blur-sm shadow-sm">
				<h3 className="text-lg font-bold text-white mb-4">Spending by Category</h3>
				<div className="h-72">
					{pieData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
									itemStyle={{ color: '#f1f5f9' }}
									formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
								/>
								<Legend iconType="circle" />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="h-full flex items-center justify-center text-slate-500 italic">No records found</div>
					)}
				</div>
			</div>

			{/* Stacked Bar Chart */}
			<div className="bg-slate-900/50 p-4 md:p-6 rounded-3xl border border-slate-800/60 backdrop-blur-sm shadow-sm">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold text-white truncate">{view === 'daily' ? 'Daily Breakdown' : 'Monthly Breakdown'}</h3>
					<div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
						<button
							onClick={() => setView('daily')}
							className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${view === 'daily' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
						>
							Daily
						</button>
						<button
							onClick={() => setView('monthly')}
							className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${view === 'monthly' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
						>
							Monthly
						</button>
					</div>
				</div>

				<div className="h-72">
					{activeData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={activeData}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
								<Tooltip
									cursor={{ fill: '#1e293b', opacity: 0.4 }}
									contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
									itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
									formatter={(val: number) => `₹${val.toLocaleString('en-IN')}`}
								/>
								<Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />

								{/* 💡 DYNAMIC STACKED BARS */}
								{allCategories.map((category, index) => (
									<Bar
										key={category}
										dataKey={category}
										stackId="a"
										fill={COLORS[index % COLORS.length]}
										radius={index === allCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
									/>
								))}
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="h-full flex items-center justify-center text-slate-500 italic">No data found</div>
					)}
				</div>
			</div>
		</div>
	)
}
