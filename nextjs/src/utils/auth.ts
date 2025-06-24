import { createClient } from '@/app/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

export async function getToken() {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}