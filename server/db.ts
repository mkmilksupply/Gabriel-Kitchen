import pg from 'pg';

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL environment variable is required');
}

/**
 * Railway’s pooled Postgres + SSL (via proxy) typically works without extra options.
 * If you connect directly, you may need:
 *   ssl: { rejectUnauthorized: false }
 */
export const pool = new Pool({
  connectionString: url,
  // ssl: { rejectUnauthorized: false }, // uncomment only if you are not using the proxy URL
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  return pool.query<T>(text, params);
}
