// server/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface JwtUser {
  id: string | number;
  email?: string;
  username?: string;
  role: string;
  name?: string;
}

export function signToken(user: JwtUser): string {
  // 12h expiry is typical — adjust as needed
  return jwt.sign(user, JWT_SECRET, { algorithm: "HS256", expiresIn: "12h" });
}

export function authMiddleware(
  req: Request & { user?: JwtUser },
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
