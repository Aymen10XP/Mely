declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      auth?: {
        userId: string;
        tenantId: string;
        role: string;
        iat?: number | undefined;
        exp?: number | undefined;
      };
    }
  }
}

export {};
