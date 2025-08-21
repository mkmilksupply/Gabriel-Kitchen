import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

/**
 * orders(id uuid pk, customer_id uuid, status text, total_amount numeric, created_at timestamptz default now())
 */

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { customer_id, status = 'new', total_amount = 0 } = req.body;
  const { rows } = await query(
    `INSERT INTO orders (id, customer_id, status, total_amount)
     VALUES (gen_random_uuid(), $1, $2, $3)
     RETURNING *`,
    [customer_id, status, total_amount]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { rows } = await query(
    `UPDATE orders SET status=$2 WHERE id=$1 RETURNING *`,
    [id, status]
  );
  res.json(rows[0] ?? null);
});

export default router;
