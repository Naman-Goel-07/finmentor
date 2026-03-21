import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// 1. Initialize with your new API key (Ensure this is updated in Vercel!)
const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

		const { income, expenses } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 })
		}

		const prompt = `
            You are FinMentor AI, a smart financial coach for students. 
            Review these expenses: ${JSON.stringify(expenses)}
            Monthly Budget: ${income}
            
            Provide a "Financial Health Review" in Markdown:
            # 1. A witty Roast or Toast.
            ## 2. Top 2 overspending categories.
            ## 3. 3 "Small Win" challenges to save ₹1000+ this month.
            ## 4. 1-year SIP projection at 12% if they save 20% of wasted money.
            
            Tone: Gen-Z friendly, conversational, use emojis.
        `

		// 2. Switched to gemini-2.5-flash for better quota stability
		const result = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		// 3. Extract text
		const adviceText = result.text || 'Coach is speechless... try again!'

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		console.error('AI Analysis Error:', error)

		// SAFETY FALLBACK: Incase of a 429 (Quota) error, return this mock roast
		if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('404')) {
			return NextResponse.json({
				advice: `# 🚨 Coach is in High-Demand!

						## Quick Roast
						Your spending is moving faster than 5G! 📉 

						## Instant Insights
						* **Overspending:** Looks like Food and Subscriptions are your wallet's biggest enemies.
						* **Small Win:** Try the "No-Spend Weekend" challenge to save some money.

						## SIP Fact
						**Saving just ₹1,000/month at 12% return gets you ₹13,200 in a year.**

						---
						*Note: Gemini is currently at capacity, but your FinMentor never sleeps!*`,
			})
		}

		return NextResponse.json(
			{
				error: 'AI Coach is busy calculating.',
				details: error.message,
			},
			{ status: 500 },
		)
	}
}
