"use client";

import { useState } from "react";
import { BookOpen, TrendingUp, ShieldAlert, CreditCard, Play, BookMarked } from "lucide-react";
import ContentModal from "@/components/ContentModal";

export default function LearningPage() {
	const lessons = [
		{
			title: "Budgeting Basics",
			description: "Learn the 50/30/20 rule and how to track your money effectively without feeling restricted.",
			icon: BookOpen,
			color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
			badge: "7 min",
			blogUrl: "https://medium.com/@subscriptioninsider/subscription-budgeting-101-the-50-30-20-rule-applied-to-digital-services-87010711d2e6",
			videoUrl: "https://www.youtube.com/embed/T7JHfLGm_GY",
		},
		{
			title: "Intro to Investing",
			description: "Understand stocks, bonds, and mutual funds. Discover why compound interest is your best friend.",
			icon: TrendingUp,
			color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
			badge: "10 min",
			blogUrl: "https://iamuhammadtahir.medium.com/intro-to-investing-5a75d06013a1",
			videoUrl: "https://www.youtube.com/embed/HNPbY6fSeo8",
		},
		{
			title: "Avoiding Debt & Credit Cards",
			description: "How credit cards work, what APR means, and strategies to pay off existing debt efficiently.",
			icon: CreditCard,
			color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
			badge: "8 min",
			blogUrl: "https://medium.com/@reginaldbbcbride/the-risks-of-being-in-debt-dc80478f1fcd",
			videoUrl: "https://www.youtube.com/embed/R8ZWwkbS6Ww",
		},
		{
			title: "UPI Scam Awareness",
			description: "Recognize common digital payment frauds and learn how to secure your accounts effectively.",
			icon: ShieldAlert,
			color: "bg-red-500/10 text-red-400 border-red-500/20",
			badge: "6 min",
			blogUrl: "https://medium.com/@weAFAR_Org/dont-wire-money-before-you-verify-a-guide-for-new-investors-c2ab1a5103a9",
			videoUrl: "https://www.youtube.com/embed/VS7_CiqTV34",
		},
	];

	const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

	return (
		<div className="animate-in fade-in duration-500">
			<header className="mb-10">
				<h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-500 bg-clip-text text-transparent leading-tight pb-1">
					Learning Center
				</h1>
				<p className="text-slate-400 mt-2 font-medium italic text-sm md:text-base">
					Master your money with bite-sized, student-first lessons.
				</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{lessons.map((lesson, idx) => (
					<div
						key={idx}
						className="group relative bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all duration-300 flex flex-col h-full overflow-hidden"
					>
						{/* Decorative Background Glow */}
						<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

						{/* Icon + Badge */}
						<div className="flex items-start justify-between mb-6 relative z-10">
							<div
								className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 duration-500 ${lesson.color}`}
							>
								<lesson.icon size={28} />
							</div>
							<span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-slate-700/30">
								{lesson.badge}
							</span>
						</div>

						{/* Title + Description */}
						<div className="relative z-10 flex-grow">
							<h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
								{lesson.title}
							</h3>
							<p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
								{lesson.description}
							</p>
						</div>

						{/* Divider */}
						<div className="relative z-10 mt-6 mb-5 h-px bg-slate-800/60" />

						{/* Action Buttons */}
						<div className="relative z-10 flex items-center gap-3">
							{/* Read Blog — opens in new tab */}
							<button
								onClick={() => window.open(lesson.blogUrl, "_blank", "noopener,noreferrer")}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-blue-300 transition-all duration-200 group/blog min-h-[44px]"
							>
								<BookMarked
									size={15}
									className="group-hover/blog:scale-110 transition-transform duration-200"
								/>
								Read Blog
							</button>

							{/* Watch Video — opens modal */}
							<button
								onClick={() => setSelectedVideo({ url: lesson.videoUrl, title: lesson.title })}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/40 hover:text-emerald-300 transition-all duration-200 group/vid min-h-[44px]"
							>
								<span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 group-hover/vid:bg-emerald-500/30 group-hover/vid:scale-110 transition-all duration-200">
									<Play size={10} fill="currentColor" className="ml-[1px]" />
								</span>
								Watch Video
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Bottom Insight Card */}
			<footer className="mt-12 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-8 text-center backdrop-blur-sm">
				<p className="text-indigo-300/80 font-bold text-sm uppercase tracking-widest mb-2">Pro Tip</p>
				<p className="text-slate-300 italic font-medium">
					&quot;Investing in knowledge always pays the best interest.&quot; — Your AI Coach
				</p>
			</footer>

			{/* Video Modal */}
			{selectedVideo && (
				<ContentModal
					url={selectedVideo.url}
					title={selectedVideo.title}
					onClose={() => setSelectedVideo(null)}
				/>
			)}
		</div>
	);
}
