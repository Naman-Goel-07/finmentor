'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteExpenseButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!id) return
		if (!confirm('Delete this record?')) return

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('expenses').delete().eq('id', id)

			if (error) {
				setIsDeleting(false)
				console.error('Delete Error:', error.message)
				alert(`Supabase Error: ${error.message}`)
				return
			}

			router.refresh()
		} catch (error) {
			console.error('Unexpected Error:', error)
			setIsDeleting(false)
		} finally {
			// Safety net
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all md:opacity-0 group-hover:opacity-100 disabled:opacity-50 cursor-pointer relative z-10"
			title="Delete Expense"
		>
			{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
		</button>
	)
}
