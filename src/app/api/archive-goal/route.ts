import { createServerClient } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
	try {
        const cookieStore = await cookies()
        const supabase = createServerClient(cookieStore.get('sb-auth-token')?.value || '')
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

		const body = await req.json()
		const { id, is_archived } = body

		if (!id) {
			return Response.json({ error: 'Goal ID is required.' }, { status: 400 })
		}

		const { error } = await supabase
			.from('goals')
			.update({ is_archived: is_archived }) // Sets it to whatever you send (true/false)
			.eq('id', id)
            .eq('user_id', user.id)

		if (error) {
			return Response.json({ error: 'DB Error: ' + error.message }, { status: 500 })
		}

		return Response.json({ success: true })
	} catch (err: unknown) {
		return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
