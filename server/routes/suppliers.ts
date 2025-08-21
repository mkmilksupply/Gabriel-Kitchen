import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

/**
 * suppliers(id uuid pk, name text, email text unique, rating numeric, active boolean default true)
 */

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM suppliers ORDER BY name ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, email, rating = 5 } = req.body;
  const { rows } = await query(
    `INSERT INTO suppliers (id, name, email, rating, active)
     VALUES (gen_random_uuid(), $1, $2, $3, true)
     RETURNING *`,
    [name, email, rating]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id/active', async (req, res) => {
  const { id } = req.params;
  const { rows } = await query(
    `UPDATE suppliers SET active = NOT active WHERE id=$1 RETURNING *`,
    [id]
  );
  res.json(rows[0] ?? null);
});

export default router;
