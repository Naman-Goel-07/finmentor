'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'navigation'
import { useState } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async () => {
		if (!id) return

		if (!confirm('Delete this record? It will be removed from your AI coaching history.')) return

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('expenses').delete().eq('id', id)

			if (error) {
				console.error('Delete Error:', error.message)
				alert('Failed to delete record. Please try again.')
				return
			}

			// Successfully deleted, refresh the page data
			router.refresh()
		} catch (error) {
			console.error('Unexpected Error:', error)
		} finally {
			// Keep it true until the refresh starts to prevent double-clicks
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
			title="Delete Expense"
		>
			{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
		</button>
	)
}
