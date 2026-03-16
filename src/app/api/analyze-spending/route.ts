import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// Don't initialize with ! here, check inside the function
const apiKey = process.env.GEMINI_API_KEY

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		if (!apiKey) {
			console.error('CRITICAL: GEMINI_API_KEY is not defined in environment variables.')
			return NextResponse.json({ error: 'AI Configuration missing. Check Vercel Env Vars.' }, { status: 500 })
		}

		const genAI = new GoogleGenerativeAI(apiKey)
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		const prompt = `
      You are FinMentor AI, a smart, slightly sarcastic, but highly helpful financial coach for college students. 
      Analyze the following expense data and provide a "Financial Health Review."
      
      User Data:
      - Monthly Income/Budget: ${income}
      - Expenses: ${JSON.stringify(expenses)}

      Your response MUST include:
      1. A "Roast" or "Toast": A one-sentence witty reaction to their spending.
      2. Key Insights: Identify the top 2 categories where they are overspending.
      3. Actionable Challenges: Give 3 specific "Small Wins".
      4. Future Value: Calculate 1-year growth if 20% of wasted money was put in an 11% SIP.

      Keep the tone conversational, use emojis, and use Markdown for formatting.
    `

		const result = await model.generateContent(prompt)
		const text = result.response.text()

		return NextResponse.json({ advice: text })
	} catch (error: any) {
		console.error('AI Analysis Error:', error)
		// Return the actual error message to the frontend so you can debug
		return NextResponse.json({ error: error.message || 'Failed to analyze data' }, { status: 500 })
	}
}
