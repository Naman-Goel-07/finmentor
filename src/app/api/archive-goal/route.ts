import supabase from '@/lib/supabaseClient'

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { id, is_archived } = body

		if (!id) {
			return Response.json({ error: 'Goal ID is required.' }, { status: 400 })
		}

		const { error } = await supabase
			.from('goals')
			.update({ is_archived: is_archived }) // Sets it to whatever you send (true/false)
			.eq('id', id)

		if (error) {
			return Response.json({ error: 'DB Error: ' + error.message }, { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err: any) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
