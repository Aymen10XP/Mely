import express from 'express';
import { register, login } from './controller/auth.controller.js';
import { tenantMiddleware } from './middleware/tenant.middleware.js';

const app = express();
app.use(express.json());

// Public Auth Routes
app.post('/api/auth/register', register); // 
app.post('/api/auth/login', login);       // 

// Example Protected Route requiring Multi-Tenancy
app.get('/api/secure-data', tenantMiddleware, (req, res) => {
  res.json({ message: 'Access granted', tenantId: (req as any).tenantId });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MELY Backend running on port ${PORT}`));