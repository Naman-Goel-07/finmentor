import { createClient } from "@supabase/supabase-js";

// Ensure a valid URL format is used to prevent the Next.js server from crashing on "your_supabase_project_url" 
// while keeping the expected structure.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
