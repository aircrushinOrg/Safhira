import { pgTable, serial, varchar, timestamp, text, boolean, integer, decimal, primaryKey, index, date, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  sessionData: text('session_data'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// Table Creation
// Sti state Table - Table recording the each STI incidence rate for Malaysia State
export const stiState = pgTable('sti_state', {
  date: integer('date').notNull(),
  state: varchar('state', { length: 255 }).notNull(),
  disease: varchar('disease', { length: 255 }).notNull(),
  cases: integer('cases').notNull(),
  incidence: numeric('incidence', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
      primaryKey({ columns: [table.date, table.state, table.disease] }),        
      index('idx_std_state_date').on(table.date),
      index('idx_std_state_state').on(table.state),
      index('idx_std_state_disease').on(table.disease),
]);