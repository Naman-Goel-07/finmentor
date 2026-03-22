import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const client = new GoogleGenAI({
	apiKey: process.env.GEMINI_API_KEY || '',
})

export async function POST(req: Request) {
	const supabase = await createClient()

	// 1. Get User
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		// 2. RATE LIMIT CHECK
		const { count, error: countError } = await supabase
			.from('ai_logs')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', user.id)
			.eq('status_code', 200)
			.gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

		if (countError) {
			console.error('Rate Limit Check failed:', countError.message)
		}

		if (count !== null && count >= 10) {
			return NextResponse.json(
				{
					error: 'DAILY_LIMIT_REACHED',
					advice: `# 🛑 Coach is out of breath!
You've used your 10 daily audits. Your wallet needs a break, and so does the AI. 

**Come back tomorrow** for more roasts. In the meantime, try to stay under budget! 💸`,
				},
				{ status: 429 },
			)
		}

		// 3. Prepare Data
		const { income, expenses, goals } = await req.json()

		// 4. Exact Prompt & Model Call
		const prompt = `
            You are FinMentor AI, the ultimate financial brain for Gen-Z students.
            USER DATA:
            - Monthly Budget: ₹${income}
            - Recent Expenses: ${JSON.stringify(expenses)}
            - Active Savings Goals: ${JSON.stringify(goals)}
            
            YOUR MISSION:
            1. Audit their spending vs. their ₹${income} budget.
            2. Identify "Goal Killers"—specific expenses preventing them from hitting those ${goals?.length || 0} goals.
            3. Check goal deadlines. If they are behind, calculate the daily saving needed to catch up.
            
            RESPONSE FORMAT (Markdown):
            # 🎤 The Financial Roast/Toast
            ## 🚩 Goal Killers
            ## 🎯 Goal Audit
            ## 🚀 The SIP "Switch" (12% returns)
            
            Tone: Gen-Z friendly, conversational, heavy on emojis 💸🔥.
        `

		const response = await client.models.generateContent({
			model: 'gemini-3-flash-preview',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		})

		const adviceText = response.text || 'Coach is speechless...'

		// 5. LOG SUCCESS (with explicit error check)
		const { error: logError } = await supabase.from('ai_logs').insert({
			user_id: user.id,
			status_code: 200,
			status_text: 'success',
		})

		if (logError) {
			// This is vital for debugging preview builds
			console.error('CRITICAL: ai_logs success insert failed:', logError.message)
		}

		return NextResponse.json({ advice: adviceText })
	} catch (error: any) {
		const isQuota = error.message?.includes('429') || error.message?.includes('quota')

		// Log Error for Background Check
		const { error: errorLogFail } = await supabase.from('ai_logs').insert({
			user_id: user.id,
			status_code: isQuota ? 429 : 500,
			status_text: isQuota ? 'quota_exceeded' : 'error',
			error_details: error.message,
		})

		if (errorLogFail) {
			console.error('CRITICAL: ai_logs error insert failed:', errorLogFail.message)
		}

		return NextResponse.json(
			{
				error: isQuota ? 'API_LIMIT_REACHED' : 'AI_COACH_OFFLINE',
				details: error.message,
			},
			{ status: isQuota ? 429 : 500 },
		)
	}
}
