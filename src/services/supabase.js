import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Helper to generate a random 6-character uppercase alphanumeric sync code
export function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Fetch remote state from Supabase by syncCode
 */
export async function fetchRemoteState(syncCode) {
  if (!supabase || !syncCode) return null;

  try {
    const { data, error } = await supabase
      .from('sync_profiles')
      .select('bricks, history, updated_at')
      .eq('sync_code', syncCode)
      .maybeSingle();

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
}

/**
 * Push local state to Supabase by syncCode
 */
export async function pushRemoteState(syncCode, bricks, history) {
  if (!supabase || !syncCode) return false;

  try {
    const { error } = await supabase.from('sync_profiles').upsert(
      {
        sync_code: syncCode,
        bricks,
        history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'sync_code' }
    );

    if (error) {
      console.error('Supabase push error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase push exception:', err);
    return false;
  }
}

/**
 * Subscribe to realtime changes for a specific syncCode
 */
export function subscribeToRealtime(syncCode, onRemoteUpdate) {
  if (!supabase || !syncCode) return () => {};

  const channel = supabase
    .channel(`sync_${syncCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sync_profiles',
        filter: `sync_code=eq.${syncCode}`,
      },
      (payload) => {
        if (payload.new && payload.new.bricks && payload.new.history) {
          onRemoteUpdate({
            bricks: payload.new.bricks,
            history: payload.new.history,
            updatedAt: payload.new.updated_at,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
