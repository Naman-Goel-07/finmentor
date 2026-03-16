import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { id, amountToAdd } = body

		// 1. Validation
		if (!id || amountToAdd === undefined) {
			return Response.json({ error: 'Goal ID and amount are required.' }, { status: 400 })
		}

		// 2. Fetch current goal amount
		const { data: currentGoal, error: fetchError } = await supabase.from('goals').select('saved_amount').eq('id', id).single()

		if (fetchError) {
			return Response.json({ error: 'Goal not found: ' + fetchError.message }, { status: 404 })
		}

		const newAmount = Number(currentGoal.saved_amount || 0) + Number(amountToAdd)

		// 3. Update the main goal balance
		const { error: updateError } = await supabase.from('goals').update({ saved_amount: newAmount }).eq('id', id)

		if (updateError) {
			return Response.json({ error: 'Failed to update goal: ' + updateError.message }, { status: 500 })
		}

		// 4. Record the history entry
		// We await this to ensure the record is created before returning success
		const { error: historyError } = await supabase.from('goal_savings').insert([
			{
				goal_id: id,
				amount: Number(amountToAdd),
				note: 'Quick save',
			},
		])

		if (historyError) {
			// Note: In a production app, you might want to rollback the goal update here,
			// but for a hackathon, a simple console.error is usually enough.
			console.error('History recording failed:', historyError.message)
		}

		return Response.json({
			success: true,
			saved_amount: newAmount,
		})
	} catch (err: any) {
		console.error('Error updating goal:', err)
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
