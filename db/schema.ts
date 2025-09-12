import { pgTable, serial, varchar, timestamp, text, boolean, integer, decimal, primaryKey, index, date, numeric } from 'drizzle-orm/pg-core';
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

// Quiz Leaderboard Table - Records each quiz attempt with results
export const quizResults = pgTable('quiz_results', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 100 }).notNull(),
  score: integer('score').notNull(), // 0-100 score
  totalQuestions: integer('total_questions').notNull().default(5),
  correctAnswers: integer('correct_answers').notNull(),
  quizType: varchar('quiz_type', { length: 50 }).notNull().default('myths'), // 'myths', 'sti', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_quiz_results_nickname').on(table.nickname),
  index('idx_quiz_results_score').on(table.score),
  index('idx_quiz_results_quiz_type').on(table.quizType),
  index('idx_quiz_results_created_at').on(table.createdAt),
]);

// Quiz Questions Table - Stores myth/fact questions for quiz functionality
export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  statement: text('statement').notNull(), // The myth/fact statement
  isTrue: boolean('is_true').notNull(), // Whether the statement is true (fact) or false (myth)
  explanation: text('explanation').notNull(), // The detailed explanation from the fact column
  category: varchar('category', { length: 50 }).notNull().default('myths'), // Category: 'myths', 'general', etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_quiz_questions_category').on(table.category),
]);

// Quiz Leaderboard Stats Table - Aggregated stats per nickname
export const quizLeaderboardStats = pgTable('quiz_leaderboard_stats', {
  nickname: varchar('nickname', { length: 100 }).primaryKey(),
  bestScore: integer('best_score').notNull().default(0),
  averageScore: numeric('average_score', { precision: 5, scale: 2 }).notNull().default('0'),
  totalAttempts: integer('total_attempts').notNull().default(0),
  quizType: varchar('quiz_type', { length: 50 }).notNull().default('myths'),
  lastPlayedAt: timestamp('last_played_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_quiz_stats_best_score').on(table.bestScore),
  index('idx_quiz_stats_total_attempts').on(table.totalAttempts),
  index('idx_quiz_stats_quiz_type').on(table.quizType),
]);