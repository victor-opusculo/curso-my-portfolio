import { drizzle } from 'drizzle-orm/libsql';

process.loadEnvFile('.env');

const db = drizzle(process.env.DB_FILE_NAME!);

export default db;