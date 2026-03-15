import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, amountToAdd } = body;

    if (!id || !amountToAdd) {
      return Response.json({ error: "Goal ID and amount to add are required." }, { status: 400 });
    }

    // Fetch current goal amount
    const { data: currentGoal, error: fetchError } = await supabase
      .from("goals")
      .select("saved_amount")
      .eq("id", id)
      .single();

    if (fetchError) {
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    const newAmount = Number(currentGoal.saved_amount) + Number(amountToAdd);

    // Update goal amount
    const { error: updateError } = await supabase
      .from("goals")
      .update({ saved_amount: newAmount })
      .eq("id", id);
      
    // Record quick save history
    await supabase.from("goal_savings").insert([{
       goal_id: id,
       amount: Number(amountToAdd),
       note: "Quick save"
    }]);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, saved_amount: newAmount });
  } catch (err: any) {
    console.error("Error updating goal:", err);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
