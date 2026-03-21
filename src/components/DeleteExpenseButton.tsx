'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async () => {
		// 1. Check if the ID even exists
		console.log('🗑️ Attempting to delete Expense ID:', id)
		if (!id) {
			alert('Component Error: No ID was passed to the delete button.')
			return
		}

		if (!confirm('Delete this record? It will be removed from your AI coaching history.')) return

		setIsDeleting(true)

		// 2. Add .select() so Supabase returns the deleted data
		const { data, error } = await supabase.from('expenses').delete().eq('id', id).select() // ✅ THE FIX: Tell me what you deleted

		if (error) {
			console.error('❌ Delete Error:', error.message)
			alert(`Failed to delete: ${error.message}`)
			setIsDeleting(false)
			return
		}

		// 3. The "Silent Failure" Check
		if (!data || data.length === 0) {
			console.warn('⚠️ Query succeeded, but NO ROWS were deleted!')
			alert('Could not delete. Check your RLS policies or if you own this row.')
			setIsDeleting(false)
			return
		}

		console.log('✅ Successfully deleted row:', data)
		setIsDeleting(false) // Reset state so the button returns to normal
		router.refresh()
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
