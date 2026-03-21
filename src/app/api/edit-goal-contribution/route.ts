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

		if (!id || !amount) {
			return Response.json({ error: 'Contribution ID and amount are required.' }, { status: 400 })
		}

		// 1. Fetch the OLD contribution record
		const { data: oldContribution, error: fetchOldError } = await supabase
			.from('goal_contributions')
			.select('amount, goal_id')
			.eq('id', id)
			.eq('user_id', user.id)
			.single()

		if (fetchOldError || !oldContribution) {
			return Response.json({ error: 'Original contribution not found.' }, { status: 404 })
		}

		// 2. Fetch the parent goal to get the current saved_amount
		const { data: currentGoal, error: fetchGoalError } = await supabase
			.from('goals')
			.select('saved_amount')
			.eq('id', oldContribution.goal_id)
			.eq('user_id', user.id)
			.single()

		if (fetchGoalError) {
			return Response.json({ error: 'Parent goal not found.' }, { status: 404 })
		}

		// 3. Calculate the Difference (Delta)
		// Formula: Delta = New - Old
		const difference = Number(amount) - Number(oldContribution.amount)
		const updatedGoalTotal = Number(currentGoal.saved_amount) + difference

		// 4. Update the contribution entry
		const { error: updateContributionError } = await supabase
			.from('goal_contributions')
			.update({
				amount: Number(amount),
				note: note || 'Updated savings entry',
			})
			.eq('id', id)
			.eq('user_id', user.id)

		if (updateContributionError) {
			return Response.json({ error: updateContributionError.message }, { status: 500 })
		}

		// 5. Update the goals table with the new synced total
		const { error: updateGoalError } = await supabase
			.from('goals')
			.update({ saved_amount: updatedGoalTotal })
			.eq('id', oldContribution.goal_id)
			.eq('user_id', user.id)

		if (updateGoalError) {
			return Response.json({ error: updateGoalError.message }, { status: 500 })
		}

		return Response.json({ success: true, new_goal_total: updatedGoalTotal })
	} catch (err: unknown) {
		console.error('Error editing contribution:', err)
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
