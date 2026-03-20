import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('sb-auth-token')?.value

	const isPublicRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

	// If no token and not a public route, redirect to login
	if (!token && !isPublicRoute) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// If logged in and trying to access login/signup, redirect to dashboard
	if (token && isPublicRoute) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Protect all routes inside the app except next.js internals and public static files
		 */
		'/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)',
	],
}
