import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import postgres from 'postgres';

let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

async function ensureTableExists() {
  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
    );`;

  if (!result[0].exists) {
    await client`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(64)
      );`;
  }

  const table = pgTable('User', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 64 }),
  });

  return table;
}

export { db, ensureTableExists };
