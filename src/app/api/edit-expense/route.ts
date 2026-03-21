import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { id, amount, category, note, date } = body

		// 1. Validation - Ensure the ID of the record is present
		if (!id) {
			return NextResponse.json({ error: 'Expense ID is required for updating.' }, { status: 400 })
		}

		if (!amount || !category || !date) {
			return NextResponse.json({ error: 'Amount, category, and date are required.' }, { status: 400 })
		}

		// 2. The Update Query
		const { data, error } = await supabase
			.from('expenses')
			.update({
				amount: parseFloat(amount),
				category,
				note,
				date,
			})
			.eq('id', id) // Find the specific expense
			.eq('user_id', user.id) // Security: Ensure user owns this record

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ success: true, data })
	} catch (err: any) {
		console.error('Error updating expense:', err)
		return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
	}
}
