// server/routes/auth.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { signToken } from "../auth.js";

const router = Router();

/**
 * POST /api/auth/login
 * body: { username, password }
 * Expect a "staff_members" table with (username text unique, password_hash text, id uuid)
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });

  const { rows } = await query<{ id: string; password_hash: string }>(
    `SELECT id, password_hash FROM staff_members WHERE username = $1 LIMIT 1`,
    [username]
  );

  if (!rows[0]) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ adminId: rows[0].id, role: "admin" });
  res.json({ access_token: token, admin_id: rows[0].id, name: username });
});

router.get("/me", (req, res) => {
  res.json({ ok: true });
});

export default router;
