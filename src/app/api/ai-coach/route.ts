import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	const supabase = await createClient()

	// 1. Authenticate
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()
	if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	try {
		// 2. 24h Rate Limit Enforcement
		const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
		const { count, error: countError } = await supabase
			.from('ai_logs')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('status_code', 200)
			.gt('created_at', last24h)

		if (count !== null && count >= 10) {
			return NextResponse.json(
				{
					error: 'DAILY_LIMIT_REACHED',
					advice: "# 🛑 Limit Reached\nYou've hit your 10 daily audits. Come back tomorrow!",
				},
				{ status: 429 },
			)
		}

		// 3. Prepare AI Data
		const { income, expenses, goals } = await req.json()

		const prompt = `
            You are FinMentor AI, an expert financial coach for Gen-Z students.
            CONTEXT:
            - Monthly Budget: ₹${income}
            - Expenses: ${JSON.stringify(expenses)}
            - Goals: ${JSON.stringify(goals)}
            
            TASK: Roast their spending habits, identify specific "Goal Killers", and audit their progress.
            FORMAT: Markdown (H1, H2, Bullet points). TONE: Brutally honest but helpful.
        `

		// 4. Generate Content
		const response = await client.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		const adviceText = response.text || 'Coach is speechless...'

		// 5. Log Success (Used for the Daily Limit Counter)
		await supabase.from('ai_logs').insert({
			user_id: user.id,
			status_code: 200,
			status_text: 'success',
		})

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		// Log Error but don't count it against the user's limit
		console.error('AI Route Error:', error.message)
		return NextResponse.json({ error: 'AI_OFFLINE', details: error.message }, { status: 500 })
	}
}
