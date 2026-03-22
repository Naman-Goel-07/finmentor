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

	const fetchProfileData = useCallback(async (userId: string, email: string) => {
		try {
			const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId).single()

			// We use the email prefix as a smarter fallback than 'User'
			const emailFallback = email.split('@')[0]

			return {
				id: userId,
				email: email,
				full_name: data?.full_name || emailFallback,
			}
		} catch (err) {
			return { id: userId, email: email, full_name: email.split('@')[0] }
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
					// 🚀 STEP 1: Check Metadata (Instant)
					// This is what you saved in your SignupPage!
					const metaName = session.user.user_metadata?.full_name

					if (metaName) {
						setUser({
							id: session.user.id,
							email: session.user.email || '',
							full_name: metaName,
						})
						setLoading(false) // 🔓 Unlock instantly with the real name
					} else {
						// 🚀 STEP 2: Fallback to Database
						const dbProfile = await fetchProfileData(session.user.id, session.user.email || '')
						if (mounted) {
							setUser(dbProfile)
							setLoading(false) // 🔓 Unlock only once DB responds
						}
					}
				} else {
					if (mounted) setLoading(false)
				}
			} catch (error) {
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
				// Handle login: Use metadata name immediately
				const metaName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'

				setUser({
					id: session.user.id,
					email: session.user.email || '',
					full_name: metaName,
				})
				setLoading(false)

				// Sync with DB in the background
				const dbProfile = await fetchProfileData(session.user.id, session.user.email || '')
				if (mounted) setUser(dbProfile)
			}
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [fetchProfileData])

	const contextValue = useMemo(() => ({ user, loading, setUser }), [user, loading])

	// 🛑 The Guard: Prevents WelcomeHeader from rendering with "null" data
	if (loading) {
		return null
	}

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
