import express from 'express';

import { authRouter } from './routes/auth.routes.js';
import { zakatRouter } from './routes/zakat.routes.js';
import { apiDocsHtml, openApiDocument } from './docs/openapi.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(express.json());

app.get('/api-docs.json', (_req, res) => {
  res.json(openApiDocument);
});

app.get('/api-docs', (_req, res) => {
  res.type('html').send(apiDocsHtml);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/zakat', zakatRouter);

app.use(notFoundHandler);
app.use(errorHandler);
