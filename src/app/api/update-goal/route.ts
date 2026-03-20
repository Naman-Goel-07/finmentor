import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { id, amountToAdd, note } = body // Added 'note' from the request body

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
		const { error: historyError } = await supabase
			.from('goal_contributions')
			.insert([
				{
					goal_id: id,
					amount: Number(amountToAdd),
					note: note || 'Quick save',
				},
			])

		if (historyError) {
			console.error('History recording failed:', historyError.message)
			// If this fails, the history won't show up on the frontend.
			return Response.json({ error: 'Balance updated but history failed: ' + historyError.message }, { status: 500 })
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
