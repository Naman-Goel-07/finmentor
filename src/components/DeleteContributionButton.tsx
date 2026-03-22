'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DeleteProps {
	id: string
	onSuccess?: () => void
}

export default function DeleteContributionButton({ id, onSuccess }: DeleteProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation()

		// Added a safety check to prevent accidental deletions
		if (!window.confirm('Are you sure you want to remove this contribution?')) {
			return
		}

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('goal_contributions').delete().eq('id', id)

			if (error) throw error

			// 2. Refresh the UI so the GoalCard re-calculates the sum without this row
			router.refresh()

			if (onSuccess) onSuccess()
		} catch (err: any) {
			alert('Could not delete contribution.')
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 disabled:opacity-100 cursor-pointer"
			title="Delete contribution"
		>
			{isDeleting ? <Loader2 size={14} className="animate-spin text-red-500" /> : <X size={14} />}
		</button>
	)
}
