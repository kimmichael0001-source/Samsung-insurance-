import { supabase } from './supabase';

/**
 * Ensures an (anonymous) Supabase session exists and returns its user id.
 * This is device-scoped identity for RLS, not a real login — see stage 3
 * of PROJECT_PLAN.md for actual phone/email authentication.
 */
export async function ensureUserId(): Promise<string | null> {
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    console.warn('Supabase anonymous sign-in failed, falling back to local demo data:', error?.message);
    return null;
  }

  return data.user.id;
}
