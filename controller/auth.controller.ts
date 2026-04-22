import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for request validation 
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(), // Bank/Tenant Name
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = RegisterSchema.parse(req.body);

    // 1. Create the Tenant (The Bank) [cite: 15]
    const tenant = await prisma.tenant.create({
      data: {
        name,
        apiKey: Buffer.from(Date.now().toString()).toString('base64'), // Unique key [cite: 15]
      },
    });

    // 2. Hash password and create Admin User 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id, // Linked to the new Tenant 
      },
    });

    res.status(201).json({ message: 'Bank Admin onboarded successfully', tenantId: tenant.id });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
};