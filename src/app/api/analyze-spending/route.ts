import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		// FIX: Use the specific model name format expected by the SDK
		// If 'gemini-1.5-flash' fails, try 'gemini-1.5-flash-latest'
		const model = genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
		})

		const prompt = `
      You are FinMentor AI, a smart financial coach for students. 
      Analyze these expenses: ${JSON.stringify(expenses)}
      Income: ${income}
      Provide: 1. A Roast/Toast, 2. Top overspending categories, 3. 3 Challenges, 4. 1-year SIP value.
      Use Markdown and Emojis.
    `

		// Add a timeout or explicit error handling for the fetch itself
		const result = await model.generateContent(prompt)
		const response = await result.response
		const text = response.text()

		if (!text) throw new Error('Empty response from AI')

		return NextResponse.json({ advice: text })
	} catch (error: any) {
		console.error('AI Analysis Error:', error)

		// Detailed error logging for Vercel
		return NextResponse.json(
			{
				error: 'AI Coach is temporarily offline.',
				details: error.message,
			},
			{ status: 500 },
		)
	}
}
