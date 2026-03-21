import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

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

		const body = await req.json()
		const { income, expenses, goals } = body

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 })
		}

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

		// Standard @google/genai call for 2026 models
		const result = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		const adviceText = result.text || 'Coach is speechless... try again!'

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		// SAFETY FALLBACK: Handle 429s or connectivity issues silently
		if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('404')) {
			return NextResponse.json({
				advice: `# 🚨 Coach is in High-Demand!

## Quick Roast
Your spending is moving faster than 5G! 📉 

## Instant Insights
* **Goal Killers:** It looks like Food and Subscriptions are fighting your savings goals.
* **Small Win:** Try the "No-Spend Weekend" challenge to redirect ₹1000 to your top goal.

## SIP Fact
**Redirecting ₹1,000/month from "wants" into an SIP at 12% gets you ₹13,200 in a year.**

---
*Note: Gemini is currently at capacity, but your FinMentor never sleeps!*`,
			})
		}

		return NextResponse.json({ error: 'AI Coach is busy calculating.' }, { status: 500 })
	}
}
