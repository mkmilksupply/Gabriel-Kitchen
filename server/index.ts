// server/index.ts
import express from "express";
import cors from "cors";
import { authMiddleware, signToken, type JwtUser } from "./auth.js";
import { Pool } from "pg";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- DB (Railway Postgres) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Railway variable
  ssl: { rejectUnauthorized: false },
});

// Health (always public)
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/**
 * PUBLIC: Login
 * Expects: { identifier: string (email or username), password: string }
 * Returns: { token, user }
 *
 * Replace the demo credential check with your own table lookup if needed.
 */
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body as {
    identifier?: string;
    password?: string;
  };

  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    // ---- EXAMPLE lookup (adjust to your schema) ----
    // If you already have a users table and password hashes, replace below with your validation.
    const byEmail = identifier.includes("@");
    const { rows } = await pool.query(
      byEmail
        ? `select id, email, username, role, name, password as pwd
           from users
           where lower(email) = lower($1) limit 1`
        : `select id, email, username, role, name, password as pwd
           from users
           where lower(username) = lower($1) limit 1`,
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const row = rows[0] as {
      id: string | number;
      email?: string;
      username?: string;
      role: string;
      name?: string;
      pwd?: string | null;
    };

    // ⚠️ For demo DBs that store plain text "password". If you use hashes, verify hash here.
    // e.g. with bcrypt: await bcrypt.compare(password, row.pwd)
    const pwdOk = !row.pwd || row.pwd === password;
    if (!pwdOk) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user: JwtUser = {
      id: row.id,
      email: row.email ?? undefined,
      username: row.username ?? undefined,
      role: row.role,
      name: row.name ?? undefined,
    };

    const token = signToken(user);
    return res.json({ token, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ---- PROTECTED ROUTES (everything below this line requires a valid token) ----
app.use("/api", authMiddleware);

// Who am I (used by frontend boot to restore session)
app.get("/api/auth/me", (req: any, res) => {
  return res.json(req.user);
});

// Example protected data endpoint used by the app
app.get("/api/staff", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `select id, email, username, role, name from users order by id asc`
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
