import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { access_token, refresh_token } = await request.json()

		if (!access_token) {
			return NextResponse.json({ error: 'Missing access token' }, { status: 400 })
		}

		// Create response to set the cookie
		const response = NextResponse.json({ success: true })

		// Set the auth token as an HTTP-only cookie
		// This bridges the gap between purely client-side supabase-js and Next.js middleware/server components
		response.cookies.set('sb-auth-token', access_token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 1 week
		})

		return response
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
}
