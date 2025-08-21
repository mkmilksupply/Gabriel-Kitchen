import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const secret = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signJwt(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJwt<T = any>(token: string) {
  return jwt.verify(token, secret) as T;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = verifyJwt(token);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
