import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()
		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { goal_name, target_amount, saved_amount, deadline } = body

		// 1. Insert the Goal
		const { data: goalData, error: goalError } = await supabase
			.from('goals')
			.insert([
				{
					user_id: user.id,
					goal_name,
					target_amount: Number(target_amount),
					deadline,
					is_archived: false,
				},
			])
			.select()
			.single()

		if (goalError) return Response.json({ error: goalError.message }, { status: 500 })

		// 2. Record the initial amount as the first contribution
		const initialAmount = Number(saved_amount || 0)

		if (initialAmount > 0) {
			const { error: contributionError } = await supabase.from('goal_contributions').insert([
				{
					user_id: user.id,
					goal_id: goalData.id,
					amount: initialAmount,
					note: 'Initial Deposit',
				},
			])

			if (contributionError) {
				return Response.json({ error: 'Goal created, but initial deposit failed.' }, { status: 500 })
			}
		}

		return Response.json({ success: true, data: goalData })
	} catch (err: any) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
