import { defineConfig } from 'drizzle-kit';

process.loadEnvFile('.env');

export default defineConfig({
    out: './data/drizzle',
    schema: './data/schema.ts',
    dialect: 'sqlite',
    dbCredentials: { 
        url: process.env.DB_FILE_NAME!,
    }
})