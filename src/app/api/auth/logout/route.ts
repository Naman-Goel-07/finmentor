import { NextResponse } from 'next/server'

export async function POST() {
	const response = NextResponse.json({ success: true })
	
	// Clear the auth cookie on logout
	response.cookies.set('sb-auth-token', '', {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 0,
	})

	return response
}
