import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

// 1. Initialize with the class name from your package.json
const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	try {
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

		// 2. Use the exact syntax required by the @google/genai SDK
		// In this version, we access the model directly through the client instance
		const result = await client.models.generateContent({
			model: 'gemini-2.0-flash', // Using the 2.0/3.0 flash stable IDs for the new SDK
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		// 3. Extract text from the new result object structure
		const adviceText = result.text || 'Coach is speechless... try again!'

		return NextResponse.json({ advice: adviceText })
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
