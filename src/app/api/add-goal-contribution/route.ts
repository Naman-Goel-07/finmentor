import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { goal_id, amount, note } = body

		if (!goal_id || !amount) {
			return Response.json({ error: 'Goal ID and amount are required.' }, { status: 400 })
		}

		// CRITICAL: We ONLY insert into 'goal_contributions'
		// We do NOT call .from('goals').insert(...) here.
		const { error: insertError } = await supabase.from('goal_contributions').insert([
			{
				user_id: user.id,
				goal_id: goal_id,
				amount: Number(amount),
				note: note || 'Manual Contribution',
			},
		])

		if (insertError) {
			return Response.json({ error: insertError.message }, { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
