'use client'

import { X, Loader2 } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteContributionButton({ id }: { id: string }) {
	const router = useRouter()
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		setIsDeleting(true)
		const { error } = await supabase.from('goal_contributions').delete().eq('id', id)

		if (error) {
			alert('Error: ' + error.message)
			setIsDeleting(false)
		} else {
			router.refresh()
		}
	}

	return (
		<button
			onClick={handleDelete}
			disabled={isDeleting}
			className="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
		>
			{isDeleting ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
		</button>
	)
}
