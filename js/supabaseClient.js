const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const SUPABASE_SPOTS_ENABLED = false;

const supabaseClient =
    (!SUPABASE_SPOTS_ENABLED || SUPABASE_URL.includes("YOUR_SUPABASE"))
    ? null
    : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
