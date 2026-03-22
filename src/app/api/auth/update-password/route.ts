import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const { currentPassword, newPassword } = body

		// 1. Basic Validation
		if (!currentPassword || !newPassword) {
			return NextResponse.json({ error: 'Both current and new passwords are required.' }, { status: 400 })
		}

		if (newPassword.length < 6) {
			return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })
		}

		const supabase = await createClient()

		// 2. Get the current logged-in user
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user || !user.email) {
			return NextResponse.json({ error: 'Unauthorized: No active session found.' }, { status: 401 })
		}

		// 3. RE-AUTHENTICATION: Verify the "previous" password
		// We try to sign in using the user's current email and the provided 'currentPassword'
		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: currentPassword,
		})

		if (signInError) {
			return NextResponse.json({ error: 'Incorrect current password.' }, { status: 401 })
		}

		// 4. Update to the new password
		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		})

		if (updateError) {
			return NextResponse.json({ error: updateError.message }, { status: 400 })
		}

		return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
	} catch (error: any) {
		console.error('Server Route Error:', error)
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
	}
}
