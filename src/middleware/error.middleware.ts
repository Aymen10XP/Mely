import type { ErrorRequestHandler, RequestHandler } from 'express';

import { HttpError, toErrorResponse } from '../lib/http.js';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'Route not found'));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const response = toErrorResponse(error);
  res.status(response.statusCode).json(response.body);
};
