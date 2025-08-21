import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const router = Router();

/**
 * staff_members(email text pk, password_hash text, role text, active boolean default true)
 */

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT email, role, active FROM staff_members ORDER BY email ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { email, password, role = 'staff' } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO staff_members (email, password_hash, role, active)
     VALUES ($1, $2, $3, true)
     RETURNING email, role, active`,
    [email, hash, role]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:email/toggle', async (req, res) => {
  const { email } = req.params;
  const { rows } = await query(
    `UPDATE staff_members SET active = NOT active WHERE email=$1 RETURNING email, role, active`,
    [email]
  );
  res.json(rows[0] ?? null);
});

export default router;
