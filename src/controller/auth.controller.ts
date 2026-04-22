import type { RequestHandler } from 'express';
import argon2 from 'argon2';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../lib/http.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';

const genericForgotPasswordMessage =
  'If an account exists for that email and tenant, a reset token has been generated.';

const buildResetUrl = (token: string, tenantId: string) => {
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, '');
  const params = new URLSearchParams({ token, tenantId });
  return `${baseUrl}/reset-password?${params.toString()}`;
};

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const signAuthToken = (payload: { userId: string; tenantId: string; role: string }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' });

export const register: RequestHandler = async (req, res) => {
  const { email, password, name } = registerSchema.parse(req.body);
  const apiKey = crypto.randomBytes(32).toString('hex');
  const passwordHash = await argon2.hash(password);

  const created = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name,
        apiKey,
      },
    });

    await tx.user.create({
      data: {
        email,
        password: passwordHash,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    return tenant;
  });

  res.status(201).json({
    message: 'Bank Admin onboarded',
    tenantId: created.id,
    apiKey,
  });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password, tenantId } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email,
      },
    },
  });

  if (!user || !(await argon2.verify(user.password, password))) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const token = signAuthToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email, tenantId } = forgotPasswordSchema.parse(req.body);
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetUrl = buildResetUrl(resetToken, tenantId);

  const user = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email,
      },
    },
  });

  if (user) {
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60_000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          tenantId,
        },
      }),
      prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(resetToken),
          expiresAt,
          userId: user.id,
          tenantId,
        },
      }),
    ]);
  }

  res.json({
    message: genericForgotPasswordMessage,
    resetToken,
    resetUrl,
    expiresInMinutes: env.PASSWORD_RESET_TOKEN_TTL_MINUTES,
  });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, newPassword, tenantId } = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tenantId,
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!resetToken) {
    throw new HttpError(400, 'Reset token is invalid, expired, or already used');
  }

  const passwordHash = await argon2.hash(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: passwordHash,
      },
    }),
    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        tenantId,
        id: {
          not: resetToken.id,
        },
      },
    }),
  ]);

  res.json({ message: 'Password reset successfully' });
};
