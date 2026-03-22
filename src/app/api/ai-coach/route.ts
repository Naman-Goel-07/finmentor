import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenAI(apiKey)

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { income, expenses, goals } = body

		if (!apiKey) {
			// This will now show up in your browser!
			return NextResponse.json({ error: 'SERVER_ERROR', details: 'GEMINI_API_KEY is missing from deployment environment variables.' }, { status: 500 })
		}

		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

		const prompt = `
            You are FinMentor AI, the ultimate financial brain for Gen-Z students.
            
            USER DATA:
            - Monthly Budget: ₹${income}
            - Recent Expenses: ${JSON.stringify(expenses)}
            - Active Savings Goals: ${JSON.stringify(goals)}
            
            YOUR MISSION:
            1. Audit their spending vs. their ₹${income} budget.
            2. Identify "Goal Killers"—specific expenses preventing them from hitting those ${goals?.length || 0} goals.
            3. Check goal deadlines. If they are behind, calculate the daily saving needed to catch up.
            
            RESPONSE FORMAT (Markdown):
            # 🎤 The Financial Roast/Toast
            (A witty, high-energy summary of their current financial state)
            
            ## 🚩 Goal Killers
            (Specific categories or items from their expenses that are stealing from their goals)
            
            ## 🎯 Goal Audit
            (Tell them if they're on track for their goals. Mention specific goal names and deadlines)
            
            ## 🚀 The SIP "Switch"
            (Show how much their "Goal Killer" spending would be worth in 1 year at 12% returns)
            
            Tone: Gen-Z friendly, conversational, heavy on emojis 💸🔥.
        `

		const result = await model.generateContent(prompt)
		const response = await result.response
		const adviceText = response.text()

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		// 🚨 CRITICAL: This returns the EXACT error to your browser console
		return NextResponse.json(
			{
				error: 'AI_BACKEND_CRASH',
				details: error.message,
				raw: JSON.stringify(error),
			},
			{ status: 500 },
		)
	}
}
