import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { goal_name, target_amount, saved_amount, deadline } = body

		if (!goal_name || target_amount === undefined || !deadline) {
			return Response.json({ error: 'Goal name, target amount, and deadline are required.' }, { status: 400 })
		}

		// ✅ FIX: Added .select().single() to return the inserted row as an object
		const { data, error } = await supabase
			.from('goals')
			.insert([
				{
					goal_name,
					target_amount,
					saved_amount: saved_amount || 0, // Ensure it's not null
					deadline,
				},
			])
			.select()
			.single()

		if (error) {
			// If the error is still "Policy violates RLS", remember to run the SQL fix
			console.error('Supabase Error:', error)
			return Response.json({ error: error.message }, { status: 500 })
		}

		return Response.json({ success: true, data })
	} catch (err: any) {
		console.error('Error inserting goal:', err)
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
