'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!id) return
		if (!confirm('Delete this record?')) return

		setIsDeleting(true)

		try {
			// CALL YOUR API ROUTE
			const response = await fetch('/api/delete-expense', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete')
			}

			// Tell Next.js to refresh the data on the screen
			router.refresh()
		} catch (error: any) {
			console.error('Delete Error:', error.message)
			alert(error.message)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all 
               opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50 cursor-pointer relative z-10"
			title="Delete Expense"
		>
			{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
		</button>
	)
}
