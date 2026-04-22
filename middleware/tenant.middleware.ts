import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check for the x-tenant-id header [cite: 28]
  const tenantIdHeader = req.headers['x-tenant-id'] as string;
  const authHeader = req.headers.authorization;

  let tenantId: string | undefined = tenantIdHeader;

  // If a JWT exists, extract the tenantId from the payload [cite: 21, 28]
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = (authHeader as string).split(' ')[1]!;
    const getSecret = () => {
      const s = process.env.JWT_SECRET;
      if (!s) throw new Error('JWT secret not configured');
      return s;
    };
    try {
      const decoded = jwt.verify(token, getSecret(), {}) as any;
      tenantId = decoded.tenantId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  if (!tenantId) {
    return res.status(403).json({ error: 'Tenant identification required' });
  }

  // Attach tenantId to the request for use in controllers [cite: 28]
  (req as any).tenantId = tenantId;
  next();
};