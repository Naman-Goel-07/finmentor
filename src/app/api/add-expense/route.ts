import { createServerClient } from "@/lib/supabaseClient"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore.get('sb-auth-token')?.value || '')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { amount, category, note, date } = body

    // Validation
    if (!amount || !category || !date) {
      return Response.json({ error: "Amount, category, and date are required." }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([
        {
          user_id: user.id,
          amount: parseFloat(amount),
          category,
          note,
          date
        }
      ])

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (err: any) {
    console.error("Error inserting expense:", err)
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
