'use client'

import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface DeleteProps {
	id: string
	onSuccess?: () => void
}

export default function DeleteContributionButton({ id, onSuccess }: DeleteProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [isDeleting, setIsDeleting] = useState(false)
	const supabase = createClient()

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation()

		// 1. Immediate visual confirmation
		setIsDeleting(true)

		// 2. OPTIMISTIC NUDGE
		// We trigger the math update (Graph/Slider) IMMEDIATELY
		// even before the database responds.
		if (onSuccess) onSuccess()

		try {
			const { error } = await supabase.from('goal_contributions').delete().eq('id', id)
			if (error) throw error

			// 3. Background Refresh
			// useTransition tells Next.js to re-fetch server data
			// without showing a "loading" state for the whole page.
			startTransition(() => {
				router.refresh()
			})
		} catch (err: any) {
			console.error('Delete failed:', err.message)
			alert('Could not delete record. Please refresh.')
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting || isPending}
			className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/item:opacity-100 disabled:opacity-50 cursor-pointer"
			title="Delete contribution"
		>
			{isDeleting || isPending ? <Loader2 size={14} className="animate-spin text-red-500" /> : <X size={14} />}
		</button>
	)
}
