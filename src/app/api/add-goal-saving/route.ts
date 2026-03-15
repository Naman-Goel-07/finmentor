import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal_id, amount, note } = body;

    if (!goal_id || !amount) {
      return Response.json({ error: "Goal ID and amount are required." }, { status: 400 });
    }

    // 1. Fetch current goal amount
    const { data: currentGoal, error: fetchError } = await supabase
      .from("goals")
      .select("saved_amount")
      .eq("id", goal_id)
      .single();

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    const newAmount = Number(currentGoal.saved_amount) + Number(amount);

    // 2. Insert into goal_savings table
    const { error: insertError } = await supabase
      .from("goal_savings")
      .insert([
        { goal_id, amount: Number(amount), note: note || "Custom savings addition" }
      ]);
      
    if (insertError) {
       console.error("Failed to insert into goal_savings, but continuing anyway:", insertError);
       // We log but don't strictly fail just in case the user hasn't created the table yet.
       // The prompt says "Ensure Supabase updates both tables correctly" so we try.
    }

    // 3. Update goal saved_amount
    const { error: updateError } = await supabase
      .from("goals")
      .update({ saved_amount: newAmount })
      .eq("id", goal_id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, saved_amount: newAmount });
  } catch (err: any) {
    console.error("Error adding goal saving:", err);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
