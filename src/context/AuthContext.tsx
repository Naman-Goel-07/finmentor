'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

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

	/**
	 * Fetches additional profile data.
	 * In production, we treat this as a non-blocking enhancement.
	 */
	const fetchProfileData = useCallback(async (userId: string, email: string) => {
		try {
			const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

			if (error && error.code !== 'PGRST116') {
				// PGRST116 is simply "no rows found", which is handled by the default return
				console.error('[AuthContext] Profile Fetch Error:', error.message)
			}

			return {
				id: userId,
				email: email,
				full_name: data?.full_name || 'FinMentor User',
			}
		} catch (err) {
			return { id: userId, email: email, full_name: 'FinMentor User' }
		}
	}, [])

	useEffect(() => {
		let mounted = true

		async function initializeAuth() {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()

				if (session?.user && mounted) {
					// 1. Set the user immediately using session data so the UI unlocks
					setUser({
						id: session.user.id,
						email: session.user.email || '',
						full_name: 'FinMentor User', // Placeholder while we fetch the real name
					})
					setLoading(false)

					// 2. Fetch the detailed profile in the background
					const fullProfile = await fetchProfileData(session.user.id, session.user.email || '')
					if (mounted) setUser(fullProfile)
				} else {
					if (mounted) setLoading(false)
				}
			} catch (error) {
				console.error('[AuthContext] Initialization Critical Failure:', error)
				if (mounted) setLoading(false)
			}
		}

		initializeAuth()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT') {
				if (mounted) {
					setUser(null)
					setLoading(false)
				}
			} else if (session?.user && mounted) {
				// Handle SIGNED_IN or TOKEN_REFRESHED
				const userData = await fetchProfileData(session.user.id, session.user.email || '')
				if (mounted) {
					setUser(userData)
					setLoading(false)
				}
			}
		})

		return () => {
			mounted = true
			subscription.unsubscribe()
		}
	}, [fetchProfileData])

	// Memoizing the value prevents unnecessary re-renders of the component tree
	const contextValue = useMemo(() => ({ user, loading, setUser }), [user, loading])

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
