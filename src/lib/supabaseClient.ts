import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// It automatically handles cookie-based auth syncing
const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export default supabase
