import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import * as argon2 from "argon2";
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(), // Bank Name
});

export const register = async (req: any, res: any) => {
  try {
    const { email, password, name } = RegisterSchema.parse(req.body);

    // Create the Tenant (Bank) [cite: 6, 15]
    const tenant = await prisma.tenant.create({
      data: {
        name,
        apiKey: Buffer.from(Date.now().toString()).toString('base64'),
      },
    });

    // Hash password with Argon2 
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    res.status(201).json({ message: 'Bank Admin onboarded', tenantId: tenant.id });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  
  // Verify with Argon2 
  if (!user || !(await argon2.verify(user.password, password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );

  res.json({ token });
};