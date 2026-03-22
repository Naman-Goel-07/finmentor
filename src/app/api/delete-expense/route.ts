import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

		const { id } = await req.json()

		if (!id) return Response.json({ error: 'ID is required' }, { status: 400 })

		// Delete from the 'expenses' table
		const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id) // Secure: only delete if it belongs to the user

		if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 })

		// Refresh the cache for the dashboard/expenses page
		revalidatePath('/expenses')

		return Response.json({ success: true })
	} catch (err) {
		return Response.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
