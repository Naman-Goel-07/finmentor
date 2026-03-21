import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

		const body = await req.json()
		const { id, amountToAdd, note } = body

		// 1. STRIKING VALIDATION
		if (!id || amountToAdd === undefined) {
			return Response.json({ error: 'Goal ID and amount are required.' }, { status: 400 })
		}

		const numericAmount = Number(amountToAdd)
		if (isNaN(numericAmount) || numericAmount <= 0) {
			return Response.json({ error: 'Please provide a valid positive number.' }, { status: 400 })
		}

		// 2. Inserting into 'goal_contributions'
		const { error: historyError } = await supabase.from('goal_contributions').insert([
			{
                user_id: user.id,
				goal_id: id,
				amount: numericAmount,
				note: note || 'Quick save',
			},
		])

		// 3. ERROR HANDLING
		if (historyError) {
			console.error('Database Error:', historyError.message)
			return Response.json({ error: 'Failed to record contribution: ' + historyError.message }, { status: 500 })
		}

		// 4. SUCCESS RESPONSE
		return Response.json({
			success: true,
			message: 'Contribution recorded successfully.',
			addedAmount: numericAmount,
		})
	} catch (err: any) {
		console.error('Unexpected Server Error:', err)
		return Response.json({ error: 'An unexpected error occurred on the server.' }, { status: 500 })
	}
}
