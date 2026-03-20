import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const { id } = await req.json()

		if (!id) return Response.json({ error: 'Goal ID is required.' }, { status: 400 })

		// 1. Delete all related history
		await supabase.from('goal_contributions').delete().eq('goal_id', id)

		// 2. Delete the main goal
		const { error } = await supabase.from('goals').delete().eq('id', id)

		if (error) return Response.json({ error: error.message }, { status: 500 })

		return Response.json({ success: true })
	} catch (err: any) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
