import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // Crucial for the CLI to see DATABASE_URL

export default defineConfig({
  datasource: {
    // This connects the schema to your .env variable
    url: process.env.DATABASE_URL!,
  },
}); 