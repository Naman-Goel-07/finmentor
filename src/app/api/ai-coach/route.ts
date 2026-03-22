import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// The new SDK initializes with an object
const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const { income, expenses, goals } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 })
		}

		// KEEPING YOUR EXACT PROMPT
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

		// FIX: In @google/genai (v1.0.0+), you call client.models.generateContent directly
		// KEEPING YOUR EXACT MODEL: gemini-2.5-flash
		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		// In the new SDK, .text is a direct property of the response
		const adviceText = response.text || 'Coach is speechless... try again!'

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		return NextResponse.json(
			{
				error: 'AI_COACH_ERROR',
				details: error.message,
			},
			{ status: 500 },
		)
	}
}
