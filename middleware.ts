import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	})

	// 1. Initialize the Supabase client specifically for Middleware
	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			get(name: string) {
				return request.cookies.get(name)?.value
			},
			set(name: string, value: string, options: CookieOptions) {
				request.cookies.set({ name, value, ...options })
				response = NextResponse.next({
					request: {
						headers: request.headers,
					},
				})
				response.cookies.set({ name, value, ...options })
			},
			remove(name: string, options: CookieOptions) {
				request.cookies.set({ name, value: '', ...options })
				response = NextResponse.next({
					request: {
						headers: request.headers,
					},
				})
				response.cookies.set({ name, value: '', ...options })
			},
		},
	})

	// 2. Get the session (this also refreshes it if it's expired)
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isPublicRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

	// 3. Redirection Logic
	if (!user && !isPublicRoute) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (user && isPublicRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	return response
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
