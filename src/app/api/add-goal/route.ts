import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { goal_name, target_amount, saved_amount, deadline } = body

		// 1. Insert the Goal
		const { data: goalData, error: goalError } = await supabase
			.from('goals')
			.insert([
				{
					goal_name,
					target_amount,
					saved_amount: saved_amount || 0,
					deadline,
					is_archived: false, // Default to active
				},
			])
			.select()
			.single()

		if (goalError) return Response.json({ error: goalError.message }, { status: 500 })

		// 2. IMPORTANT: If there's an initial amount, create a contribution record
		if (saved_amount > 0) {
			const { error: contributionError } = await supabase.from('goal_contributions').insert([
				{
					goal_id: goalData.id,
					amount: saved_amount,
					description: 'Initial Deposit',
				},
			])

			if (contributionError) console.error('Failed to create initial contribution:', contributionError)
		}

		return Response.json({ success: true, data: goalData })
	} catch (err: any) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
