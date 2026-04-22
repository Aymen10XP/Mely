import type { RequestHandler } from 'express';

import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http.js';
import { calculateZakat } from '../services/zakat.service.js';
import { zakatCalculationSchema } from '../schemas/zakat.schema.js';

export const calculateZakatHandler: RequestHandler = async (req, res) => {
  const body = zakatCalculationSchema.parse(req.body);

  if (!req.auth) {
    throw new HttpError(401, 'Authentication required');
  }

  if (!req.tenantId) {
    throw new HttpError(403, 'Tenant identification required');
  }

  const breakdown = calculateZakat(body);

  const record = await prisma.zakatLog.create({
    data: {
      assetType: body.assetType,
      amount: breakdown.eligibleAmount,
      grossAmount: body.grossAmount,
      deductions: body.deductions,
      nisabAmount: body.nisabAmount,
      calculated: breakdown.zakatDue,
      notes: body.notes ?? null,
      userId: req.auth.userId,
      tenantId: req.tenantId,
    },
  });

  res.status(201).json({
    record,
    breakdown,
  });
};
