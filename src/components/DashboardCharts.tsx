'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

export default function DashboardCharts({ expenses }: { expenses: any[] }) {
	const [view, setView] = useState<'daily' | 'monthly'>('daily')

	// --- 1. Category Logic (Pie Chart) ---
	const categoryMap: Record<string, number> = {}
	expenses.forEach((e) => {
		categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
	})
	const pieData = Object.keys(categoryMap)
		.map((key) => ({ name: key, value: categoryMap[key] }))
		.sort((a, b) => b.value - a.value)

	// --- 2. Daily Aggregation (Last 7 Days) ---
	const dailyMap: Record<string, number> = {}
	const last7Days = [...Array(7)]
		.map((_, i) => {
			const d = new Date()
			d.setDate(d.getDate() - i)
			return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
		})
		.reverse()

	last7Days.forEach((day) => (dailyMap[day] = 0))
	expenses.forEach((e) => {
		const dateKey = new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
		if (dailyMap.hasOwnProperty(dateKey)) dailyMap[dateKey] += e.amount
	})
	const dailyData = last7Days.map((day) => ({ name: day, Total: dailyMap[day] }))

	// --- 3. Monthly Aggregation ---
	const monthMap: Record<string, number> = {}
	expenses.forEach((e) => {
		const d = new Date(e.date)
		const month = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
		monthMap[month] = (monthMap[month] || 0) + e.amount
	})
	const monthlyData = Object.keys(monthMap)
		.map((key) => ({ name: key, Total: monthMap[key] }))
		// Sorts the Data according to dates
		.sort((a, b) => {
			const dateA = new Date(a.name)
			const dateB = new Date(b.name)
			return dateA.getTime() - dateB.getTime()
		})

	const activeData = view === 'daily' ? dailyData : monthlyData

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
			{/* Category Pie Chart */}
			<div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
				<h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Category</h3>
				<div className="h-72">
					{pieData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`} />
								<Legend iconType="circle" />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div className="h-full flex items-center justify-center text-gray-400">No data</div>
					)}
				</div>
			</div>

			{/* Bar Chart with Toggle */}
			<div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 w-full">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold text-gray-800 truncate">{view === 'daily' ? 'Daily Spending' : 'Monthly Spending'}</h3>
					{/* 💡 THE TOGGLE BUTTONS */}
					<div className="flex bg-gray-100 p-1 rounded-lg">
						<button
							onClick={() => setView('daily')}
							className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							Daily
						</button>
						<button
							onClick={() => setView('monthly')}
							className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${view === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
						>
							Monthly
						</button>
					</div>
				</div>

				<div className="h-72">
					{activeData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={activeData}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
								<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
								<YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
								<Tooltip
									cursor={{ fill: '#f8fafc' }}
									formatter={(val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
								/>
								<Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="h-full flex items-center justify-center text-gray-400">No data found</div>
					)}
				</div>
			</div>
		</div>
	)
}
