# FinMentor AI 🚀
https://finmentor-eight.vercel.app/

**FinMentor AI** is a high-energy, Gen-Z-focused financial intervention tool. Developed by Team **HarTime Error**, the platform transforms boring expense tracking into a personalized, "roast-style" coaching experience powered by Google Gemini.
Most financial apps are spreadsheets in disguise. **FinMentor AI** is different. It uses AI to analyze spending patterns, identify "Goal Killers" (like that daily Zomato habit), and give you the brutal honesty you need to actually hit your savings goals.

## ✨ Key Features
* **Responsive Dashboard:** A sleek, dark-mode UI designed for the mobile-first generation.
* **AI Coach:** Get daily financial audits and roasts. The AI scans your recent 20 expenses and compares them against your active goals.
* **Expense Auditor:** Add you daily expenses to maintain history of all that coach flow.
* **Goal Tracker:** Automatically calculates the daily savings needed to hit deadlines. If you're behind, the AI tells you exactly what to cut.

## 🛠️ Tech Stack
* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), Tailwind CSS, Lucide React, Framer Motion.
* **Backend:** Next.js API Routes (Edge Runtime compatible).
* **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security).
* **AI Engine:** [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai`.
* **State Management:** React Context API + Singleton Supabase Client pattern.

## 🚀 Getting Started

### Prerequisites
* Node.js 18+
* A Supabase Project
* A Google AI Studio API Key (Gemini)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Naman-Goel-07/finmentor.git
   cd finmentor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Database & Security
The project utilizes **PostgreSQL Row Level Security (RLS)** to ensure data privacy. Users can only access their own expenses and goals.


## 📝 License
All rights reserved by Team HarTime Error.
