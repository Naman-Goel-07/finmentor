'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ✅ 1. INITIALIZE OUTSIDE THE COMPONENT
// This ensures the Supabase instance is a singleton and stable.
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

	// ✅ 2. STABLE PROFILE FETCH
	const getProfile = useCallback(async (userId: string, email: string) => {
		try {
			const { data: profile, error } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

			if (error && error.code !== 'PGRST116') {
				// PGRST116 is "no rows found"
				console.error('Error fetching profile:', error.message)
			}

			return {
				id: userId,
				email: email || '',
				full_name: profile?.full_name || 'FinMentor User',
			}
		} catch (err) {
			return { id: userId, email: email || '', full_name: 'FinMentor User' }
		}
	}, [])

	useEffect(() => {
		let mounted = true

		async function initializeAuth() {
			try {
				// setLoading(true) // ❌ REMOVE THIS: It triggers unnecessary re-renders

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

		// 🔄 3. SMART AUTH LISTENER
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT') {
				if (mounted) {
					setUser(null)
					setLoading(false)
				}
				return
			}

			if (session?.user) {
				const userData = await getProfile(session.user.id, session.user.email!)
				if (mounted) {
					setUser(userData)
					setLoading(false)
				}
			} else {
				if (mounted) {
					setUser(null)
					setLoading(false)
				}
			}
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [getProfile]) // getProfile is now stable because supabase is outside

	// ✅ 4. MEMOIZE CONTEXT VALUE
	// This prevents children (like ClientShell) from re-rendering unless data actually changes
	const value = useMemo(() => ({ user, loading, setUser }), [user, loading])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
