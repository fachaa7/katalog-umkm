import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL dan SUPABASE_SECRET_KEY harus diisi di environment variable");
  }

  return createClient(supabaseUrl, supabaseKey);
}
