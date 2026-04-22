import { Router } from 'express';

import { calculateZakatHandler } from '../controller/zakat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

export const zakatRouter = Router();

zakatRouter.post('/calculate', authMiddleware, tenantMiddleware, calculateZakatHandler);
