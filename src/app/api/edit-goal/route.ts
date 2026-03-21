import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { id, goal_name, target_amount, deadline } = body

		// 1. Validation
		if (!id) {
			return Response.json({ error: 'Goal ID is required.' }, { status: 400 })
		}

		if (!goal_name || !target_amount || !deadline) {
			return Response.json({ error: 'Goal name, target amount, and deadline are required.' }, { status: 400 })
		}

		// 2. Update the Goal
		const { data, error } = await supabase
			.from('goals')
			.update({
				goal_name,
				target_amount: parseFloat(target_amount),
				deadline,
			})
			.eq('id', id)
			.eq('user_id', user.id) // Secure: Only allow the owner to edit
			.select()
			.single()

		if (error) {
			return Response.json({ error: error.message }, { status: 500 })
		}

		return Response.json({ success: true, data })
	} catch (err: any) {
		console.error('Error updating goal:', err)
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
