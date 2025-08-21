// server/index.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";
import ordersRoutes from "./routes/orders.js";
import staffRoutes from "./routes/staff.js";
import suppliersRoutes from "./routes/suppliers.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/suppliers", suppliersRoutes);

// Serve Vite build if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.resolve(__dirname, "../../dist");
app.use(express.static(clientDir));
app.get("*", (_req, res) => res.sendFile(path.join(clientDir, "index.html")));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on :${port}`);
});
