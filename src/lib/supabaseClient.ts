import { createBrowserClient, createServerClient as supabaseSSRServer } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 1. Default export (for Client Components like Login/Signup)
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
export default supabase

// 2. Named export (for Server Components & API Routes)
// This is what your build is screaming for!
export function createServerClient() {
	const cookieStore = cookies()

	return supabaseSSRServer(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value
			},
			set(name: string, value: string, options: any) {
				try {
					cookieStore.set({ name, value, ...options })
				} catch (error) {
					// Handled by middleware
				}
			},
			remove(name: string, options: any) {
				try {
					cookieStore.set({ name, value: '', ...options })
				} catch (error) {
					// Handled by middleware
				}
			},
		},
	})
}
