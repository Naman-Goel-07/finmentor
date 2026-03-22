'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation' // We use this to refresh the page

interface DeleteProps {
	id: string
	onSuccess?: () => void
}

export default function DeleteContributionButton({ id, onSuccess }: DeleteProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async (e: React.MouseEvent) => {
		e.stopPropagation()

		if (!window.confirm('Are you sure you want to remove this contribution?')) {
			return
		}

		setIsDeleting(true)

		try {
			// FIX: Call your API route instead of the Supabase client directly
			const response = await fetch('/api/delete-goal-contribution', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: id }),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Failed to delete')
			}

			// 1. Tell Next.js to fetch fresh data for the page
			router.refresh()

			// 2. Run the success callback (usually to close a modal or show a toast)
			if (onSuccess) onSuccess()
		} catch (err: any) {
			console.error('Delete error:', err)
			alert(err.message || 'Could not delete contribution.')
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className={`
        p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer
        ${
			isDeleting
				? 'opacity-100' // Keep visible while deleting
				: 'opacity-100 md:opacity-0 md:group-hover/item:opacity-100' // Normal hover logic
		}
    `}
			title="Delete contribution"
		>
			{isDeleting ? <Loader2 size={14} className="animate-spin text-red-500" /> : <X size={14} />}
		</button>
	)
}
