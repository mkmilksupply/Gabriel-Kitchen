// server/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt, { type SignOptions, type Secret, type JwtPayload as JWTBasePayload } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-secret-change-me";

// jsonwebtoken@9 uses a narrow template string type for durations.
// This matches values like "7d", "12h", "30m", etc.
type DurationString = `${number}${"ms" | "s" | "m" | "h" | "d" | "w" | "y"}`;

export type JwtPayload = JWTBasePayload & { adminId: string; role?: string };

export function signToken(
  payload: JwtPayload,
  expiresIn: number | DurationString = "7d"
): string {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
