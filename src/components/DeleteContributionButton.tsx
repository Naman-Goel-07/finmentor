'use client'

import { X, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteContributionButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async (e: React.MouseEvent) => {
		// 🛑 CRITICAL: Prevents the GoalCard from toggling/expanding when you click delete
		e.stopPropagation()

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('goal_contributions').delete().eq('id', id)

			if (error) {
				alert('Error: ' + error.message)
				setIsDeleting(false)
			} else {
				// Refresh the server component to update the progress bar and history
				router.refresh()
				// We don't setIsDeleting(false) here because the component
				// will be removed from the DOM when the list refreshes.
			}
		} catch (err) {
			console.error(err)
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors opacity-0 group-hover/item:opacity-100 disabled:opacity-100 cursor-pointer"
		>
			{isDeleting ? <Loader2 size={12} className="animate-spin text-blue-600" /> : <X size={14} />}
		</button>
	)
}
