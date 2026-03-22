import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
	try {
		const supabase = await createClient()

		// 1. Tell Supabase to invalidate the session
		await supabase.auth.signOut()

		const response = NextResponse.json({ success: true })

		// 2. ✅ CRITICAL: Delete your custom cookie name
		// This is the cookie your Middleware is likely picking up
		response.cookies.set('sb-auth-token', '', {
			path: '/',
			maxAge: 0, // Kill it immediately
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})

		return response
	} catch (error) {
		return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
	}
}
