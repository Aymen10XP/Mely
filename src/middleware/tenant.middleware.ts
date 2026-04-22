import type { RequestHandler } from 'express';

import { HttpError } from '../lib/http.js';

const getTenantIdFromHeader = (headerValue: string | string[] | undefined) => {
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
};

export const tenantMiddleware: RequestHandler = (req, _res, next) => {
  const tenantIdFromHeader = getTenantIdFromHeader(req.headers['x-tenant-id']);
  const tenantIdFromToken = req.auth?.tenantId;

  if (tenantIdFromHeader && tenantIdFromToken && tenantIdFromHeader !== tenantIdFromToken) {
    next(new HttpError(403, 'Tenant header does not match the authenticated tenant'));
    return;
  }

  const resolvedTenantId = tenantIdFromHeader ?? tenantIdFromToken;

  if (!resolvedTenantId) {
    next(new HttpError(403, 'Tenant identification required'));
    return;
  }

  req.tenantId = resolvedTenantId;
  next();
};
