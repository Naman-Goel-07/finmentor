import { BookOpen, TrendingUp, ShieldAlert, CreditCard } from "lucide-react";

export default function LearningPage() {
  const lessons = [
    {
      title: "Budgeting Basics",
      description: "Learn the 50/30/20 rule and how to track your money effectively without feeling restricted.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      time: "5 min read"
    },
    {
      title: "Intro to Investing",
      description: "Understand stocks, bonds, and mutual funds. Discover why compound interest is your best friend.",
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      time: "10 min read"
    },
    {
      title: "Avoiding Debt Traps",
      description: "How credit cards work, what APR means, and strategies to pay off existing debt efficiently.",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600",
      time: "8 min read"
    },
    {
      title: "UPI Scam Awareness",
      description: "Recognize common digital payment frauds and learn how to secure your accounts.",
      icon: ShieldAlert,
      color: "bg-red-50 text-red-600",
      time: "6 min read"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Learning Center</h1>
        <p className="text-gray-500 mt-1">Boost your financial literacy with bite-sized lessons.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {lessons.map((lesson, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
             <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${lesson.color}`}>
                   <lesson.icon size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                   <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md mt-1 inline-block">
                     {lesson.time}
                   </span>
                </div>
             </div>
             <p className="text-gray-600 flex-grow">{lesson.description}</p>
             <button className="mt-6 text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-800 transition-colors self-start cursor-pointer">
                Start Lesson &rarr;
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}
