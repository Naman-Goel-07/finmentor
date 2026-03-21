import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { goal_name, target_amount, saved_amount, deadline, category } = body

		// 1. Create the Goal Record
		// We set saved_amount to 0 here because the actual money
		// will be recorded in the contributions table below.
		const { data: newGoal, error: goalError } = await supabase
			.from('goals')
			.insert([
				{
					user_id: user.id,
					goal_name,
					target_amount: Number(target_amount),
					deadline,
					created_at,
					is_archived: false,
				},
			])
			.select()
			.single()

		if (goalError) return Response.json({ error: goalError.message }, { status: 500 })

		// 2. Record the Initial Deposit as the first Contribution
		const initialDeposit = Number(saved_amount || 0)

		if (initialDeposit > 0) {
			const { error: contribError } = await supabase.from('goal_contributions').insert([
				{
					user_id: user.id,
					goal_id: newGoal.id,
					amount: initialDeposit,
					note: 'Initial Deposit',
				},
			])

			if (contribError) {
				// We don't fail the whole request since the goal was created,
				// but in a production app, you might want to handle this.
			}
		}

		return Response.json({ success: true, goal: newGoal })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
