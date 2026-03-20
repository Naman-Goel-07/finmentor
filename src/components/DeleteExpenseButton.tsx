'use client'

import { Trash2, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		// Confirmation dialog to prevent accidental clicks during demo
		if (!confirm('Delete this record? It will be removed from your AI coaching history.')) return

		setIsDeleting(true)
		const { error } = await supabase.from('expenses').delete().eq('id', id)

		if (error) {
			console.error('Delete Error:', error.message)
			alert('Failed to delete record.')
			setIsDeleting(false)
		} else {
			// Refreshes the Server Component data without a full page reload
			router.refresh()
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
