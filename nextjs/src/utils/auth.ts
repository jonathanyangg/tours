import { createClient } from '@/app/supabase/client';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

// Simple in-memory cache
let cachedSession: Session | null = null;
let lastChecked = 0;
const CACHE_DURATION = 50 * 60 * 1000; // 5 minutes

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient();
  }
  return supabaseClient;
}

export async function getToken() {
  try {
    // Return cached token if recent
    if (cachedSession && Date.now() - lastChecked < CACHE_DURATION) {
      return cachedSession.access_token;
    }

    // Get session (checks localStorage first, then API if needed)
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Update cache
    cachedSession = session;
    lastChecked = Date.now();

    return session?.access_token || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}