'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ✅ 1. INITIALIZE OUTSIDE
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

	const getProfile = useCallback(async (userId: string, email: string) => {
		console.log('🔍 [AuthContext] Fetching profile for:', userId)

		// Create a promise that rejects after 2 seconds
		const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))

		try {
			// Race the Supabase query against our timeout
			const profileQuery = supabase.from('profiles').select('full_name').eq('id', userId).single()

			const result = (await Promise.race([profileQuery, timeout])) as any

			return {
				id: userId,
				email: email || '',
				full_name: result.data?.full_name || 'FinMentor User',
			}
		} catch (err) {
			console.warn('⚠️ [AuthContext] Profile fetch failed or timed out. Using default.')
			return {
				id: userId,
				email: email || '',
				full_name: 'FinMentor User',
			}
		}
	}, [])

	useEffect(() => {
		let mounted = true
		console.log('🚀 [AuthContext] Initializing Auth...')

		async function initializeAuth() {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession()

				if (error) {
					console.error('❌ [AuthContext] Session error:', error.message)
				}

				if (session?.user && mounted) {
					console.log('✅ [AuthContext] Session found:', session.user.email)
					const userData = await getProfile(session.user.id, session.user.email!)
					setUser(userData)
				} else {
					console.log('ℹ️ [AuthContext] No session found on mount')
				}
			} catch (error) {
				console.error('❌ [AuthContext] Init failed:', error)
			} finally {
				if (mounted) {
					console.log('🏁 [AuthContext] Loading set to false')
					setLoading(false)
				}
			}
		}

		initializeAuth()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('🔄 [AuthContext] Auth Event:', event)
			if (session?.user) {
				const userData = await getProfile(session.user.id, session.user.email!)
				if (mounted) setUser(userData)
			} else {
				if (mounted) setUser(null)
			}
			if (mounted) setLoading(false)
		})

		// 🚨 EMERGENCY UNLOCK: If still loading after 5s, something is wrong
		const timer = setTimeout(() => {
			if (mounted && loading) {
				console.warn('⚠️ [AuthContext] Emergency Unlock triggered!')
				setLoading(false)
			}
		}, 5000)

		return () => {
			mounted = false
			subscription.unsubscribe()
			clearTimeout(timer)
		}
	}, [getProfile]) // Removed 'loading' from dependencies to prevent loops

	const value = useMemo(() => ({ user, loading, setUser }), [user, loading])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
