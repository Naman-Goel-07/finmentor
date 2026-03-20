import { createServerClient } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
	try {
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore.get('sb-auth-token')?.value || '')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

		const { id } = await req.json()

		if (!id) return Response.json({ error: 'Goal ID is required.' }, { status: 400 })

		// 1. Delete all related history
		await supabase.from('goal_contributions').delete().eq('goal_id', id).eq('user_id', user.id)

		// 2. Delete the main goal
		const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)

		if (error) return Response.json({ error: error.message }, { status: 500 })

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
