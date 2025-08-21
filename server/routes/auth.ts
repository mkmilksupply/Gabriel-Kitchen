import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signJwt } from '../auth.js';

const router = Router();

/**
 * Very basic auth:
 * Expects a table "staff_members(email text primary key, password_hash text, role text, active boolean)"
 * Adapt if you use username instead of email.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  const result = await query<{ email: string; password_hash: string; role: string; active: boolean }>(
    'SELECT email, password_hash, role, active FROM staff_members WHERE email=$1 LIMIT 1',
    [email]
  );
  const user = result.rows[0];
  if (!user || !user.active) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signJwt({ sub: user.email, role: user.role });
  res.json({ access_token: token, user: { email: user.email, role: user.role } });
});

router.get('/me', (req, res) => {
  // Client should send Bearer token; /me is typically protected at server/index.ts via requireAuth
  res.json({ ok: true });
});

export default router;
