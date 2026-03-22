import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { id, amount, note } = body

		if (!id || amount === undefined) {
			return Response.json({ error: 'Contribution ID and amount are required.' }, { status: 400 })
		}

		// 1. Update ONLY the contribution entry in the history table
		const { error: updateContributionError } = await supabase
			.from('goal_contributions')
			.update({
				amount: Number(amount),
				note: note || 'Updated contribution',
			})
			.eq('id', id)
			.eq('user_id', user.id)

		if (updateContributionError) {
			return Response.json({ error: updateContributionError.message }, { status: 500 })
		}

		// 2. We skip updating the 'goals' table entirely.
		// When the frontend refreshes, the GoalCard will re-sum the history
		// and show the correct progress automatically.

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
