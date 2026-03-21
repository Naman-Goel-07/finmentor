import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const { income, expenses, goals } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing' }, { status: 500 })
		}

		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		const prompt = `
            You are FinMentor AI, the ultimate financial brain for Gen-Z students.
            
            USER DATA:
            - Monthly Budget: ₹${income}
            - Recent Expenses: ${JSON.stringify(expenses)}
            - Active Savings Goals: ${JSON.stringify(goals)}
            
            YOUR MISSION:
            1. Audit their spending vs. their ₹${income} budget.
            2. Identify "Goal Killers"—specific expenses stealing from their ${goals?.length || 0} goals.
            3. Calculate daily savings needed if they are behind on deadlines.
            
            RESPONSE FORMAT (Markdown):
            # 🎤 The Financial Roast/Toast
            (Witty, high-energy summary)
            
            ## 🚩 Goal Killers
            (Specific categories/items from their data)
            
            ## 🎯 Goal Audit
            (Deadline check and daily saving targets)
            
            ## 🚀 The SIP "Switch"
            (Projection at 12% returns)
            
            Tone: Gen-Z friendly, conversational, emojis 💸🔥.
        `

		const result = await model.generateContent(prompt)
		const response = await result.response
		const adviceText = response.text()

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		// Fallback Roast so the user isn't stuck loading
		return NextResponse.json({
			advice: `# 🚨 Coach is overwhelmed!
Your spending habits are so wild they broke the AI. ☕
**Quick Tip:** Skip the Zomato tonight and put that ₹500 into your top goal. Your future self is watching!`,
		})
	}
}
