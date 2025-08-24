// server/index.ts
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ use .js extensions because we compile to ESM JS
import authRoutes from "./routes/auth.js";            // keep if present
import staffRoutes from "./routes/staff.js";       // uncomment if you have it

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- API ----------------
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
// if (staffRoutes) app.use("/api/staff", staffRoutes);

// --------------- Static client (React build) ---------------
/**
 * In Railway, the working dir is the project root (/app).
 * Vite outputs to "<root>/dist". Using process.cwd() is the most reliable.
 */
const clientDir = path.resolve(process.cwd(), "dist");
console.log("Serving client from:", clientDir);

app.use(express.static(clientDir));

// Let API 404s stay JSON
app.get("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));

// SPA fallback: send index.html for any non-API route
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDir, "index.html"));
});

// --------------- Start ----------------
const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
