// server/routes/orders.ts
import { Router } from "express";
import { query } from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (_req, res) => {
  const { rows } = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`);
  res.json(rows);
});

export default router;
