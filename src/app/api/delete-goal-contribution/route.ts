import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { id } = body // This is the ID of the specific contribution row

		if (!id) {
			return Response.json({ error: 'Contribution ID is required.' }, { status: 400 })
		}

		// 1. Fetch the contribution to get its amount and the parent goal_id
		const { data: contribution, error: fetchContribError } = await supabase
			.from('goal_contributions')
			.select('amount, goal_id')
			.eq('id', id)
			.eq('user_id', user.id)
			.single()

		if (fetchContribError || !contribution) {
			return Response.json({ error: 'Contribution not found.' }, { status: 404 })
		}

		// 2. Fetch the current goal total
		const { data: goal, error: fetchGoalError } = await supabase
			.from('goals')
			.select('saved_amount')
			.eq('id', contribution.goal_id)
			.eq('user_id', user.id)
			.single()

		if (fetchGoalError) {
			return Response.json({ error: 'Parent goal not found.' }, { status: 404 })
		}

		// 3. Delete the contribution record
		const { error: deleteError } = await supabase.from('goal_contributions').delete().eq('id', id).eq('user_id', user.id)

		if (deleteError) {
			return Response.json({ error: 'Failed to delete record.' }, { status: 500 })
		}

		// 4. Update the goal total (Subtract the deleted amount)
		const newTotal = Number(goal.saved_amount) - Number(contribution.amount)
		await supabase
			.from('goals')
			.update({ saved_amount: Math.max(newTotal, 0) }) // Ensure we don't go below 0
			.eq('id', contribution.goal_id)
			.eq('user_id', user.id)

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
