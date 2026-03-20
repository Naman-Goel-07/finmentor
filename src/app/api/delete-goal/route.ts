import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "Goal ID is required." }, { status: 400 });
    }

    await supabase.from("goal_savings").delete().eq("goal_id", id);

    // Delete the goal
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
       return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting goal:", err);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
