import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	})

	// 1. Initialize modern Supabase SSR Client
	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
				supabaseResponse = NextResponse.next({
					request,
				})
				cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
			},
		},
	})

	// IMPORTANT: Do not run any extra logic between createServerClient and getUser!
	// 2. Get the session (this securely refreshes it if it's expired)
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isPublicRoute =
		request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup' || request.nextUrl.pathname.startsWith('/auth/callback')

	// 3. Redirection Logic (With Cookie Preservation!)
	if (!user && !isPublicRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/login'
		const redirectResponse = NextResponse.redirect(url)

		// CRITICAL: Forward the refreshed cookies to the redirect response
		supabaseResponse.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
		})

		return redirectResponse
	}

	if (user && isPublicRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/dashboard'
		const redirectResponse = NextResponse.redirect(url)

		// CRITICAL: Forward the refreshed cookies to the redirect response
		supabaseResponse.cookies.getAll().forEach((cookie) => {
			redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
		})

		return redirectResponse
	}

	return supabaseResponse
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - Public images (svg, png, jpg)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
