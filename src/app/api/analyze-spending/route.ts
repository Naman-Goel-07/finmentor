import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on Vercel' }, { status: 500 })
		}

		// 1. Setup Models (Gemini 3 Flash is the 2026 workhorse)
		const modelId = 'gemini-3-flash-preview'
		const fallbackId = 'gemini-2.5-flash'

		let model = genAI.getGenerativeModel({ model: modelId })

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

		// 2. Try generating content with Fallback logic
		let result
		try {
			result = await model.generateContent(prompt)
		} catch (e) {
			console.warn(`Model ${modelId} failed, trying fallback ${fallbackId}`)
			model = genAI.getGenerativeModel({ model: fallbackId })
			result = await model.generateContent(prompt)
		}

		const text = result.response.text()
		return NextResponse.json({ advice: text })
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
