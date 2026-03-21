'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

	const supabase = createClient()
	
	// Helper to fetch profile data from our custom 'profiles' table
	const getProfile = useCallback(async (userId: string, email: string) => {
		const { data: profile, error } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

		if (error) {
			console.error('Error fetching profile:', error.message)
		}

		return {
			id: userId,
			email: email || '',
			full_name: profile?.full_name || 'FinMentor User',
		}
	}, [])

	useEffect(() => {
		let mounted = true

		async function initializeAuth() {
			try {
				setLoading(true)
				const {
					data: { session },
				} = await supabase.auth.getSession()

				if (session?.user && mounted) {
					const userData = await getProfile(session.user.id, session.user.email!)
					setUser(userData)
				}
			} catch (error) {
				console.error('Auth initialization failed:', error)
			} finally {
				if (mounted) setLoading(false)
			}
		}

		initializeAuth()

		// Listen for auth state changes (login, logout, token refresh)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user) {
				const userData = await getProfile(session.user.id, session.user.email!)
				if (mounted) setUser(userData)
			} else {
				if (mounted) setUser(null)
			}
			if (mounted) setLoading(false)
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [getProfile])

	return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
