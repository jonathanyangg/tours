import { createClient } from '@/app/supabase/client';

export async function getToken() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return null;
    }

    const token = session.access_token;
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}