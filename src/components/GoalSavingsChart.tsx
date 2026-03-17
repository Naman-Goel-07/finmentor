'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

interface GoalSavingsChartProps {
	savings: any[]
	refreshTrigger?: number
}

export default function GoalSavingsChart({ savings, refreshTrigger = 0 }: GoalSavingsChartProps) {
	// ✅ Recalculates the cumulative timeline whenever savings or the nudge changes
	const chartData = useMemo(() => {
		if (!savings || savings.length === 0) return []

		// 1. Sort ascending so the line flows from left-to-right (chronological)
		const sortedSavings = [...savings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

		let cumulative = 0
		const dataMap: { [key: string]: number } = {}

		sortedSavings.forEach((entry) => {
			const dateStr = format(new Date(entry.created_at), 'MMM dd')
			cumulative += Number(entry.amount)
			// Updates or sets the running total for that specific day
			dataMap[dateStr] = cumulative
		})

		return Object.keys(dataMap).map((date) => ({
			date,
			amount: dataMap[date],
		}))
	}, [savings, refreshTrigger])

	if (chartData.length === 0) {
		return (
			<div className="h-40 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 rounded-xl mt-6 border border-dashed border-slate-200">
				No savings recorded yet.
			</div>
		)
	}

	return (
		<div className="w-full h-48 mt-6">
			<p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Savings Progress</p>
			<ResponsiveContainer width="100%" height="100%">
				{/* ✅ The 'key' forces a hard-reset of the SVG. 
                Without this, Recharts might not update the Y-axis scale after a deletion. */}
				<LineChart key={`chart-${chartData.length}-${refreshTrigger}`} data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />

					<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }} dy={10} />

					<YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => `₹${value}`} />

					<Tooltip
						contentStyle={{
							borderRadius: '12px',
							border: 'none',
							boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
							fontSize: '12px',
							fontWeight: 'bold',
						}}
						formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Cumulative Total']}
					/>

					<Line
						type="monotone"
						dataKey="amount"
						stroke="#2563EB"
						strokeWidth={3}
						dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
						activeDot={{ r: 6, strokeWidth: 0 }}
						animationDuration={800} // Fast, snappy response for the demo
						isAnimationActive={true}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
