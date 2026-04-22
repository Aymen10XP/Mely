import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().trim().min(2),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  tenantId: z.uuid(),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
  tenantId: z.uuid(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  newPassword: z.string().min(8),
  tenantId: z.uuid(),
});
