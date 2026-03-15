import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "Goal ID is required." }, { status: 400 });
    }

    // Based on common "archive" setups, we just update an is_archived flag. 
    // Assuming the user might not have created an `is_archived` column, 
    // we can attempt the update, and if it fails, fallback to something else, or just update it.
    const { error } = await supabase
      .from("goals")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) {
       // If the column does not exist, an error is returned. 
       return Response.json({ error: "Make sure you have an is_archived column: " + error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Error archiving goal:", err);
    return Response.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
