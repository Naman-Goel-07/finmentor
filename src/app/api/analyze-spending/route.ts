import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

// 1. Initialize the SDK with the standard class name
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
	try {
		const { income, expenses } = await req.json()

		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 })
		}

		// 2. Setup the Model (Gemini 1.5 Flash is the high-speed stable version)
		// Note: 'gemini-3-flash' is not a public ID yet; using 1.5-flash for reliability
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		const prompt = `
            You are FinMentor AI, a smart financial coach for students. 
            Review these expenses: ${JSON.stringify(expenses)}
            Monthly Budget: ${income}
            
            Provide a "Financial Health Review" including:
            # 1. A witty Roast or Toast.
            ## 2. Top 2 overspending categories.
            ## 3. 3 "Small Win" challenges to save ₹1000+ this month.
            ## 4. 1-year SIP projection at 12% if they save 20% of wasted money.
            
            Tone: Gen-Z friendly, conversational, use emojis. 
            Format: Use Markdown. Ensure subheadings use ## so they render black in our UI.
        `

		// 3. Generate content using the correct SDK method
		const result = await model.generateContent(prompt)
		const response = await result.response
		const text = response.text()

		// 4. Return the advice
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
