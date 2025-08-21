// server/routes/staff.ts
import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";
import bcrypt from "bcryptjs";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res) => {
  const { rows } = await query(`SELECT id, username, role, created_at FROM staff_members ORDER BY created_at DESC`);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { username, password, role = "staff" } = req.body || {};
  const password_hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO staff_members (username, password_hash, role) VALUES ($1,$2,$3) RETURNING id, username, role, created_at`,
    [username, password_hash, role]
  );
  res.status(201).json(rows[0]);
});

export default router;
