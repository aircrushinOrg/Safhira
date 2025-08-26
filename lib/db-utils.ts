import { db } from '../app/db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function createUser(email: string, name?: string) {
  const result = await db.insert(users).values({
    email,
    name,
  }).returning();
  
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getAllUsers() {
  return await db.select().from(users);
}

export async function createSession(userId: number, sessionData?: string, expiresAt?: Date) {
  const result = await db.insert(sessions).values({
    userId,
    sessionData,
    expiresAt,
  }).returning();
  
  return result[0];
}

export async function getActiveSessions(userId: number) {
  return await db.select().from(sessions).where(eq(sessions.userId, userId));
}