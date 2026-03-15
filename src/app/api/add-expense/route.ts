import supabase from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
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
