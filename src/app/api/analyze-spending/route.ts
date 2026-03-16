import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		// 1. Prepare the model
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		// 2. Craft a high-impact system prompt
		const prompt = `
      You are FinMentor AI, a smart, slightly sarcastic, but highly helpful financial coach for college students. 
      Analyze the following expense data and provide a "Financial Health Review."
      
      User Data:
      - Monthly Income/Budget: ${income}
      - Expenses: ${JSON.stringify(expenses)}

      Your response MUST include:
      1. A "Roast" or "Toast": A one-sentence witty reaction to their spending.
      2. Key Insights: Identify the top 2 categories where they are overspending (e.g., Food delivery, Subscriptions).
      3. Actionable Challenges: Give 3 specific "Small Wins" (e.g., "Delete Swiggy for 3 days to save ₹600").
      4. Future Value: Calculate how much they'd have in 1 year if they invested just 20% of their "wasted" money into an 11% SIP.

      Keep the tone conversational, use emojis, and use Markdown for formatting.
    `

		const result = await model.generateContent(prompt)
		const response = await result.response
		const text = response.text()

		return NextResponse.json({ advice: text })
	} catch (error) {
		console.error('AI Analysis Error:', error)
		return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 })
	}
}
