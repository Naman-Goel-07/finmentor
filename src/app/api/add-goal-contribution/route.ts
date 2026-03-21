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

		// ONLY insert into the history table.
		// The UI will calculate the total dynamically.
		const { error: insertError } = await supabase.from('goal_contributions').insert([
			{
				user_id: user.id,
				goal_id,
				amount: Number(amount),
				note: note || 'Manual Contribution',
			},
		])

		if (insertError) {
			return Response.json({ error: 'Failed to record contribution.' }, { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
