import { BookOpen, TrendingUp, ShieldAlert, CreditCard } from 'lucide-react'

export default function LearningPage() {
	const lessons = [
		{
			title: 'Budgeting Basics',
			description: 'Learn the 50/30/20 rule and how to track your money effectively without feeling restricted.',
			icon: BookOpen,
			color: 'bg-blue-50 text-blue-600',
			time: '7 min read',
			url: 'https://medium.com/@subscriptioninsider/subscription-budgeting-101-the-50-30-20-rule-applied-to-digital-services-87010711d2e6',
		},
		{
			title: 'Intro to Investing',
			description: 'Understand stocks, bonds, and mutual funds. Discover why compound interest is your best friend.',
			icon: TrendingUp,
			color: 'bg-green-50 text-green-600',
			time: '10 min read',
			url: 'https://iamuhammadtahir.medium.com/intro-to-investing-5a75d06013a1',
		},
		{
			title: 'Avoiding Debt Traps',
			description: 'How credit cards work, what APR means, and strategies to pay off existing debt efficiently.',
			icon: CreditCard,
			color: 'bg-purple-50 text-purple-600',
			time: '8 min read',
			url: 'https://medium.com/@reginaldbbcbride/the-risks-of-being-in-debt-dc80478f1fcd',
		},
		{
			title: 'UPI Scam Awareness',
			description: 'Recognize common digital payment frauds and learn how to secure your accounts.',
			icon: ShieldAlert,
			color: 'bg-red-50 text-red-600',
			time: '6 min read',
			url: 'https://medium.com/@weAFAR_Org/dont-wire-money-before-you-verify-a-guide-for-new-investors-c2ab1a5103a9',
		},
	]

	return (
		<div>
			<header className="mb-8">
				<h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
					Learning Center
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic">Boost your financial literacy with bite-sized lessons.</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{lessons.map((lesson, idx) => (
					<div
						key={idx}
						className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
					>
						<div className="flex items-start gap-4 mb-4">
							<div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lesson.color}`}>
								<lesson.icon size={24} />
							</div>
							<div>
								<h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
								<span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md mt-1 inline-block">{lesson.time}</span>
							</div>
						</div>
						<p className="text-gray-600 flex-grow text-sm md:text-base">{lesson.description}</p>

						{/* ✅ UPDATED: Wrapped button in an external link tag */}
						<a
							href={lesson.url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-6 text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors self-start min-h-[44px]"
						>
							Start Lesson &rarr;
						</a>
					</div>
				))}
			</div>
		</div>
	)
}
