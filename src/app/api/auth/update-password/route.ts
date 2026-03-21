import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { newPassword } = body

		if (!newPassword || newPassword.length < 6) {
			return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
		}

		// Initialize the Supabase server client
		// (Awaiting is best practice for Next.js 14+ SSR cookies)
		const supabase = await createClient()

		// Securely update the password from the server
		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
	} catch (error: any) {
		console.error('Server Route Error:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
