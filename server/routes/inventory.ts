// server/routes/inventory.ts
import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM inventory_items ORDER BY name ASC`);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { name, unit, current_stock = 0 } = req.body || {};
  const { rows } = await query(
    `INSERT INTO inventory_items (name, unit, current_stock) VALUES ($1,$2,$3) RETURNING *`,
    [name, unit, current_stock]
  );
  res.status(201).json(rows[0]);
});

export default router;
