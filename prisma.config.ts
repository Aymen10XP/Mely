import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Manually load the .env file
dotenv.config();

export default defineConfig({
  datasource: {
    // Ensuring the URL is treated as a string
    url: process.env.DATABASE_URL as string,
  },
});