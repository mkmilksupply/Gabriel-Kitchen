const API_MODE = (import.meta.env.VITE_API_MODE ?? 'api') as 'api' | 'supabase'

/** Lazy import only when we truly need Supabase */
async function sdb() {
  const mod = await import('./supabaseClient')
  return mod.DatabaseService
}
async function sauth() {
  const mod = await import('./supabaseClient')
  return {
    authenticateWithDatabase: mod.authenticateWithDatabase,
    authenticateWithUsername: mod.authenticateWithUsername,
  }
}

/* --------------------------- REST helper (API) --------------------------- */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'include',
    ...init,
  })
  if (!res.ok) {
    let text = ''
    try {
      text = await res.text()
    } catch {}
    throw new Error(text || `Request failed: ${res.status}`)
  }
  // Health or empty responses may not be JSON
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? ((await res.json()) as T) : (undefined as T)
}

/* ------------------------------- Auth API ------------------------------- */

export async function login(email: string, password: string) {
  if (API_MODE === 'supabase') {
    const { authenticateWithDatabase } = await sauth()
    return await authenticateWithDatabase(email, password)
  }
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function loginWithUsername(username: string, password: string) {
  if (API_MODE === 'supabase') {
    const { authenticateWithUsername } = await sauth()
    return await authenticateWithUsername(username, password)
  }
  return request('/api/auth/login-username', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

/* ------------------------------ Staff API ------------------------------- */

export async function getStaffMembers() {
  if (API_MODE === 'supabase') {
    return await (await sdb()).getStaffMembers()
  }
  return request('/api/staff')
}

/* ------------------------------ Add yours ------------------------------- */
/**
 * If you have more exports in your original dataClient (products, suppliers,
 * orders, etc.), keep them here. For each function that *sometimes* uses
 * Supabase, follow the same pattern:
 *
 *   if (API_MODE === 'supabase') {
 *     return await (await sdb()).someMethod(...)
 *   }
 *   return request('/api/whatever', { ... })
 */
