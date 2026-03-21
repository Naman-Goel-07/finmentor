'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async (e: React.MouseEvent) => {
		if (!id) return

		if (!confirm('Delete this record?')) return

		// 1. Start the loading state and visually hide the row immediately
		setIsDeleting(true)

		// OPTIMISTIC HACK: Find the table row and hide it instantly via CSS
		const row = (e.target as HTMLElement).closest('tr')
		if (row) {
			row.style.transition = 'opacity 0.2s ease, transform 0.2s ease'
			row.style.opacity = '0.3' // Dim it first
			row.style.pointerEvents = 'none' // Prevent double clicks
		}

		try {
			// 2. Fire and forget (mostly)
			const { error } = await supabase.from('expenses').delete().eq('id', id)

			if (error) throw error

			// 3. Use startTransition for the refresh.
			// This prevents the UI from "freezing" while the server re-fetches data.
			startTransition(() => {
				router.refresh()
			})
		} catch (error: any) {
			console.error('Delete Error:', error.message)
			alert('Failed to delete. Please try again.')
			// Restore the row if it fails
			if (row) {
				row.style.opacity = '1'
				row.style.pointerEvents = 'auto'
			}
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting || isPending}
			className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
		>
			{isDeleting || isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
		</button>
	)
}
