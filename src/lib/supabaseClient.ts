import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * Supabase is OPTIONAL.
 * - VITE_API_MODE = "api"      → Never create a Supabase client (null)
 * - VITE_API_MODE = "supabase" → Create it, and require the env vars
 */
const MODE = (import.meta.env.VITE_API_MODE ?? 'api') as 'api' | 'supabase'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  MODE === 'supabase' && supabaseUrl && supabaseAnonKey
    ? createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    : null

if (MODE === 'supabase' && !supabase) {
  throw new Error('Missing Supabase environment variables')
}

/* ---------------------------- Realtime helpers ---------------------------- */

export function subscribeToTable(
  table: string,
  cb: () => void
): { unsubscribe: () => void } {
  if (!supabase) {
    // In API mode, realtime is a no-op.
    return { unsubscribe: () => {} }
  }

  const channel = supabase
    .channel(`table-changes-${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => cb()
    )
    .subscribe()

  return { unsubscribe: () => channel.unsubscribe() }
}

/* ---------------------------- Guard (supabase) ---------------------------- */

async function ensureSupabase() {
  if (!supabase) throw new Error('Supabase client is disabled in API mode')
}

/* ---------------------------- Database service ---------------------------- */
/**
 * Keep just the methods you actually use. Add the `await ensureSupabase()` guard
 * at the top of every method that needs Supabase.
 */
export const DatabaseService = {
  async getStaffMembers() {
    await ensureSupabase()
    const { data, error } = await supabase!
      .from('users')
      .select('*')
      .eq('role', 'staff')
      .order('id', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  // EXAMPLE: add similar guarded methods here if you use them elsewhere
  // async getProducts() { ... },
  // async getSuppliers() { ... },
}

/* --------------------------------- Auth ---------------------------------- */
/**
 * Your app previously used username/email + password with Supabase tables,
 * not Supabase Auth. Keep these helpers if you still use table-based auth
 * in “supabase” mode. In API mode the React side should use the REST API.
 */
export async function authenticateWithDatabase(
  email: string,
  password: string
) {
  await ensureSupabase()
  const { data, error } = await supabase!
    .from('users')
    .select('id, email, name, role')
    .eq('email', email)
    .eq('password', password) // NOTE: for demo parity; use hashing in real apps.
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Invalid credentials')
  return data
}

export async function authenticateWithUsername(
  username: string,
  password: string
) {
  await ensureSupabase()
  const { data, error } = await supabase!
    .from('users')
    .select('id, username, name, role')
    .eq('username', username)
    .eq('password', password) // NOTE: for demo parity; use hashing in real apps.
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Invalid credentials')
  return data
}
