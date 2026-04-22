import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { env } from '../config/env.js';
import { HttpError } from '../lib/http.js';

const tokenPayloadSchema = z.object({
  userId: z.uuid(),
  tenantId: z.uuid(),
  role: z.string().min(1),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Authorization bearer token is required'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.auth = tokenPayloadSchema.parse(decoded);
    next();
  } catch (error) {
    next(new HttpError(401, 'Invalid or expired token', error));
  }
};
