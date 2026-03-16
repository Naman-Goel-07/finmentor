import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// The new SDK uses a slightly different initialization
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		// Gemini 2.5 Flash is the 2026 standard for cost-efficient AI
		const model = 'gemini-2.5-flash'

		const prompt = `
      You are FinMentor AI, a slightly sarcastic financial coach for students. 
      Review these expenses: ${JSON.stringify(expenses)}
      Income: ${income}
      Provide: 1. A Roast, 2. Overspending categories, 3. 3 Challenges, 4. SIP Projection.
    `

		// New SDK method: client.models.generate_content
		const response = await client.models.generateContent({
			model: model,
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		return NextResponse.json({ advice: response.text })
	} catch (error: any) {
		console.error('AI Analysis Error:', error)
		return NextResponse.json({ error: 'AI Coach is recalibrating. Try again!' }, { status: 500 })
	}
}
