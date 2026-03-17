'use client'

import { X, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation' // ✅ Added for server-sync
import { useState } from 'react'

interface DeleteProps {
	id: string
	onSuccess?: () => void
}

export default function DeleteContributionButton({ id, onSuccess }: DeleteProps) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async (e: React.MouseEvent) => {
		// 🛑 Prevents the GoalCard from toggling/expanding
		e.stopPropagation()

		// Optional: Add a quick confirm so you don't delete by accident during the demo
		// if (!confirm("Delete this saving?")) return

		setIsDeleting(true)

		try {
			const { error } = await supabase.from('goal_contributions').delete().eq('id', id)

			if (error) throw error

			// ✅ 1. Trigger the local nudge (updates the Graph & Slider math)
			if (onSuccess) onSuccess()

			// ✅ 2. Tell Next.js to re-fetch the server data
			router.refresh()
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
