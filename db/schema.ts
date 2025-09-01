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
      index('idx_sti_state_date').on(table.date),
      index('idx_sti_state_state').on(table.state),
      index('idx_sti_state_disease').on(table.disease),
]);

// STI Information Table - Detailed information about each STI
export const stiInfo = pgTable('sti_info', {
  name: varchar('name', { length: 255 }).primaryKey(),
  type: varchar('type', { length: 50 }).notNull(), // 'Bacterial', 'Viral', 'Parasitic'
  severity: varchar('severity', { length: 20 }).notNull(), // 'Low', 'Medium', 'High'
  treatability: varchar('treatability', { length: 20 }).notNull(), // 'Curable', 'Manageable', 'Preventable'
  symptomsCommon: text('symptoms_common').notNull(), // JSON array as text
  symptomsWomen: text('symptoms_women').notNull(), // JSON array as text
  symptomsMen: text('symptoms_men').notNull(), // JSON array as text
  symptomsGeneral: text('symptoms_general').notNull(), // JSON array as text
  transmission: text('transmission').notNull(), // JSON array as text
  healthEffects: text('health_effects').notNull(), // JSON array as text
  prevention: text('prevention').notNull(), // JSON array as text
  treatment: text('treatment').notNull(),
  malaysianContext: text('malaysian_context').notNull(),
}, (table) => [
  index('idx_sti_info_type').on(table.type),
  index('idx_sti_info_severity').on(table.severity),
]);