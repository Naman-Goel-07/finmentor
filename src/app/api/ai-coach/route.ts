import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// Initialize the SDK outside the handler to see if it's an API Key load issue
const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenAI(apiKey)

export async function POST(req: Request) {
	try {
		console.log('>>> [DEBUG] AI Coach request received')

		const supabase = await createClient()
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			console.error('>>> [DEBUG] Auth Error:', authError)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { income, expenses, goals } = body

		if (!apiKey) {
			console.error('>>> [DEBUG] API Key is missing in environment variables')
			return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 })
		}

		// KEEPING YOUR EXACT MODEL
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

		console.log('>>> [DEBUG] Sending request to Gemini...')

		// Robust call pattern
		const result = await model.generateContent(prompt)
		const response = await result.response
		const adviceText = response.text()

		console.log('>>> [DEBUG] AI responded successfully')
		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		// This log will appear in your VS Code terminal
		console.error('>>> [CRITICAL BACKEND ERROR]:', error)

		return NextResponse.json(
			{
				error: 'AI Coach Error',
				details: error.message,
				stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
			},
			{ status: 500 },
		)
	}
}
