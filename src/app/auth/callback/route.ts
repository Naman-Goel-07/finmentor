import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get('code')
	const next = searchParams.get('next') ?? '/dashboard'

	if (code) {
		const cookieStore = cookies()
		const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value
				},
				set(name: string, value: string, options: CookieOptions) {
					cookieStore.set({ name, value, ...options })
				},
				remove(name: string, options: CookieOptions) {
					cookieStore.set({ name, value: '', ...options })
				},
			},
		})

		// 1. Exchange the temporary code for a real session
		const { data, error } = await supabase.auth.exchangeCodeForSession(code)

		if (!error && data.session) {
			const response = NextResponse.redirect(`${origin}${next}`)

			// 2. MANUALLY set your 'sb-auth-token' to match your login/middleware logic
			response.cookies.set('sb-auth-token', data.session.access_token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 7, // 1 week
			})

			return response
		}
	}

	// If something fails, send them back to login
	return NextResponse.redirect(`${origin}/login?message=auth-error`)
}
