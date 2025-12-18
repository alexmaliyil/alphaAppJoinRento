/**
 * Rento Global Configuration
 */

/**
 * Set this to `true` to use Supabase (Development / Mock mode).
 * Set this to `false` to connect to the live Laravel backend API.
 */
export const USE_SUPABASE = true;

export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.rento.com/v1',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};
