import { Router } from 'express';

import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from '../controller/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
