import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.startsWith("http") ? rawUrl : "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

// Standard client for Browser/Client components
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Secure helper for Next.js Server Components and backend API routes
// Extracts the HTTP cookie token and passes it explicitly to the standard supabase-js client
export function createServerClient(token: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
}
