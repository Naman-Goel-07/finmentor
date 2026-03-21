'use client'

import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteProps {
	id: string
	onSuccess?: () => void
}

export default function DeleteContributionButton({ id, onSuccess }: DeleteProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation() // Prevents GoalCard from toggling

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('goal_contributions').delete().eq('id', id)

			if (error) throw error

			// 1. Tell Next.js to re-fetch server data
			router.refresh()

			// 2. Trigger the local update (Graph/Slider) only after DB success
			if (onSuccess) onSuccess()
		} catch (err: any) {
			console.error('Delete failed:', err.message)
			alert('Could not delete saving.')
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
			{isDeleting ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <X size={14} />}
		</button>
	)
}
