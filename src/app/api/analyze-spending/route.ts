import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// 1. Use the new 2026 SDK Class
const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on Vercel' }, { status: 500 })
		}

		// 2. Setup Models (Gemini 3 Flash is the 2026 standard)
		const modelId = 'gemini-3-flash'
		const fallbackId = 'gemini-2.5-flash'

		const prompt = `
      You are FinMentor AI, a smart financial coach for students. 
      Review these expenses: ${JSON.stringify(expenses)}
      Monthly Budget: ${income}
      
      Provide a "Financial Health Review" including:
      1. A witty Roast or Toast.
      2. Top 2 overspending categories.
      3. 3 "Small Win" challenges to save ₹1000+ this month.
      4. 1-year SIP projection at 12% if they save 20% of wasted money.
      
      Tone: Gen-Z friendly, conversational, use emojis. Format in Markdown.
    `

		// 3. Try generating content with the new SDK syntax
		let result
		try {
			result = await client.models.generateContent({
				model: modelId,
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
			})
		} catch (e) {
			console.warn(`Model ${modelId} failed, trying fallback ${fallbackId}`)
			result = await client.models.generateContent({
				model: fallbackId,
				contents: [{ role: 'user', parts: [{ text: prompt }] }],
			})
		}

		// 4. Return the text directly from the result object
		return NextResponse.json({ advice: result.text })
	} catch (error: any) {
		console.error('AI Analysis Error:', error)
		return NextResponse.json(
			{
				error: 'AI Coach is busy calculating.',
				details: error.message,
			},
			{ status: 500 },
		)
	}
}
