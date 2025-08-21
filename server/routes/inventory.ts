import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

/**
 * inventory_items(id uuid primary key, name text, category text, current_stock int, unit text, cost_per_unit numeric, updated_at timestamptz)
 */

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM inventory_items ORDER BY name ASC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, category, unit, current_stock = 0, cost_per_unit = 0 } = req.body;
  const { rows } = await query(
    `INSERT INTO inventory_items (id, name, category, unit, current_stock, cost_per_unit, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, now())
     RETURNING *`,
    [name, category, unit, current_stock, cost_per_unit]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, unit, current_stock, cost_per_unit } = req.body;
  const { rows } = await query(
    `UPDATE inventory_items
     SET name=$2, category=$3, unit=$4, current_stock=$5, cost_per_unit=$6, updated_at=now()
     WHERE id=$1
     RETURNING *`,
    [id, name, category, unit, current_stock, cost_per_unit]
  );
  res.json(rows[0] ?? null);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM inventory_items WHERE id=$1', [id]);
  res.status(204).end();
});

export default router;
