import { BookOpen, TrendingUp, ShieldAlert, CreditCard } from 'lucide-react'

export default function LearningPage() {
	const lessons = [
		{
			title: 'Budgeting Basics',
			description: 'Learn the 50/30/20 rule and how to track your money effectively without feeling restricted.',
			icon: BookOpen,
			color: 'bg-blue-50 text-blue-600',
			time: '5 min read',
			// ✅ Added external link
			url: 'https://www.investopedia.com/ask/answers/022916/what-503020-budgeting-rule.asp',
		},
		{
			title: 'Intro to Investing',
			description: 'Understand stocks, bonds, and mutual funds. Discover why compound interest is your best friend.',
			icon: TrendingUp,
			color: 'bg-green-50 text-green-600',
			time: '10 min read',
			// ✅ Added external link
			url: 'https://www.clearias.com/investing-for-beginners/',
		},
		{
			title: 'Avoiding Debt Traps',
			description: 'How credit cards work, what APR means, and strategies to pay off existing debt efficiently.',
			icon: CreditCard,
			color: 'bg-purple-50 text-purple-600',
			time: '8 min read',
			// ✅ Added external link
			url: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1931335',
		},
		{
			title: 'UPI Scam Awareness',
			description: 'Recognize common digital payment frauds and learn how to secure your accounts.',
			icon: ShieldAlert,
			color: 'bg-red-50 text-red-600',
			time: '6 min read',
			// ✅ Added external link
			url: 'https://www.npci.org.in/what-we-do/upi/safety-awareness',
		},
	]

	return (
		<div className="max-w-6xl mx-auto w-full">
			<header className="mb-8">
				<h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-700 bg-clip-text text-transparent">
					Learning Center
				</h1>
				<p className="text-gray-500 mt-1 font-medium">Boost your financial literacy with bite-sized lessons.</p>
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
