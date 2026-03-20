'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '@/lib/supabaseClient'

type UserState = {
	id: string
	email: string
	full_name: string
} | null

interface AuthContextType {
	user: UserState
	loading: boolean
	setUser: React.Dispatch<React.SetStateAction<UserState>>
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserState>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let mounted = true

		async function fetchUser() {
			const hasSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
			
			if (!hasSupabaseUrl) {
				console.warn('Supabase URL not configured locally. Skipping AuthContext user fetch to prevent browser network hang.')
				if (mounted) {
					setUser(null)
					setLoading(false)
				}
				return
			}

			try {
				setLoading(true)
				const { data: { user } } = await supabase.auth.getUser()

				if (user) {
					const { data: profile } = await supabase
						.from('profiles')
						.select('full_name')
						.eq('id', user.id)
						.single()

					if (mounted) {
						setUser({
							id: user.id,
							email: user.email || '',
							full_name: profile?.full_name || '',
						})
					}
				} else {
					if (mounted) setUser(null)
				}
			} catch (error) {
				console.error('Failed to authenticate session:', error)
				if (mounted) setUser(null)
			} finally {
				if (mounted) setLoading(false)
			}
		}

		fetchUser()

		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT' || !session) {
				if (mounted) setUser(null)
				// Session cleared centrally.
			} else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
				const { data: profile } = await supabase
					.from('profiles')
					.select('full_name')
					.eq('id', session.user.id)
					.single()

				if (mounted) {
					setUser({
						id: session.user.id,
						email: session.user.email || '',
						full_name: profile?.full_name || '',
					})
				}
			}
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [])

	return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
