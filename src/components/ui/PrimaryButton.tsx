'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface PrimaryButtonProps {
	onClick?: () => void
	icon: LucideIcon
	label: string
	className?: string
}

export default function PrimaryButton({ onClick, icon: Icon, label, className }: PrimaryButtonProps) {
	return (
		<button
			onClick={onClick}
			className={clsx(
				'w-full md:w-auto min-h-[44px] px-6 py-2 font-bold text-slate-900 bg-gray-100 hover:bg-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95',
				className,
			)}
		>
			<Icon size={18} className="shrink-0" />
			<span>{label}</span>
		</button>
	)
}
