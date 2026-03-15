import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal_name, target_amount, saved_amount, deadline } = body;

    if (!goal_name || target_amount === undefined || !deadline) {
      return Response.json({ error: "Goal name, target amount, and deadline are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("goals")
      .insert([
        {
          goal_name,
          target_amount,
          saved_amount,
          deadline
        }
      ]);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err: any) {
    console.error("Error inserting goal:", err);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
