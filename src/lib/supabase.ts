import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = "https://foxeaycfzqtpqyhkzjee.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZveGVheWNmenF0cHF5aGt6amVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2ODM0MjksImV4cCI6MjA5MjI1OTQyOX0.E1OunH3E9S157IDZOpBXYPEaLjCBNDiSoCRhyaUykmQ";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type { Database };
