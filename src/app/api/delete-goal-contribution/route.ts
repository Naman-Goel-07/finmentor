import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache' // <--- Add this

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const body = await req.json()
		const { id } = body

		if (!id) {
			return Response.json({ error: 'Contribution ID is required.' }, { status: 400 })
		}

		// Delete the contribution record
		const { error: deleteError } = await supabase.from('goal_contributions').delete().eq('id', id).eq('user_id', user.id)

		if (deleteError) {
			return Response.json({ error: deleteError.message }, { status: 500 })
		}
		
		revalidatePath('/goals')

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
