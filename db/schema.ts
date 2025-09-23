import { pgTable, serial, varchar, timestamp, text, boolean, integer, decimal, primaryKey, index, date, numeric, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
// Table Creation
// State dictionary table
export const state = pgTable('state', {
  stateId: serial('state_id').primaryKey(),
  stateName: varchar('state_name', { length: 255 }).notNull(),
}, (table) => [
  index('idx_state_name').on(table.stateName),
]);

// Prevalence table (renamed from sti_state)
// Records STI prevalence per Malaysian state and year
export const prevalence = pgTable('prevalence', {
  stiId: integer('sti_id').notNull().references(() => sti.stiId, { onDelete: 'cascade' }),
  stateId: integer('state_id').notNull().references(() => state.stateId),
  prevalenceYear: integer('prevalence_year').notNull(),
  prevalenceCases: integer('prevalence_cases').notNull(),
  prevalenceIncidence: numeric('prevalence_incidence', { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.stiId, table.stateId, table.prevalenceYear] }),
  index('idx_prevalence_year').on(table.prevalenceYear),
  index('idx_prevalence_state').on(table.stateId),
  index('idx_prevalence_sti').on(table.stiId),
]);

// Healthcare Provider directory
export const provider = pgTable('provider', {
  providerId: serial('provider_id').primaryKey(),
  stateId: integer('state_id').notNull().references(() => state.stateId),
  providerName: varchar('provider_name', { length: 255 }).notNull(),
  providerAddress: text('provider_address').notNull(),
  providerPhoneNum: varchar('provider_phone_num', { length: 50 }),
  providerEmail: varchar('provider_email', { length: 255 }),
  providerLongitude: numeric('provider_longitude', { precision: 9, scale: 6 }),
  providerLatitude: numeric('provider_latitude', { precision: 9, scale: 6 }),
  providerProvidePrep: boolean('provider_provide_prep').notNull().default(false),
  providerProvidePep: boolean('provider_provide_pep').notNull().default(false),
  providerFreeStiScreening: boolean('provider_free_sti_screening').notNull().default(false),
  providerGooglePlaceId: text('provider_google_place_id').notNull(),
}, (table) => [
  index('idx_provider_state').on(table.stateId),
  index('idx_provider_name').on(table.providerName),
]);

// Participant table records quiz/chat participants by nickname
export const participant = pgTable('participant', {
  participantId: serial('participant_id').primaryKey(),
  participantNickname: varchar('participant_nickname', { length: 255 }).notNull(),
});

// STI table (renamed from sti_info)
// Dropped JSON array text columns into separate relation tables (see below)
export const sti = pgTable('sti', {
  stiId: serial('sti_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'Bacterial', 'Viral', 'Parasitic'
  severity: varchar('severity', { length: 20 }).notNull(), // 'Low', 'Medium', 'High'
  treatability: varchar('treatability', { length: 20 }).notNull(), // 'Curable', 'Manageable', 'Preventable'
  treatment: text('treatment').notNull(),
  malaysianContext: text('malaysian_context').notNull(),
}, (table) => [
  index('idx_sti_type').on(table.type),
  index('idx_sti_severity').on(table.severity),
  index('idx_sti_name').on(table.name),
]);

// Dictionary tables + join tables for Symptoms, Transmission, Health Effects, Prevention

// SYMPTOM dictionary
export const symptom = pgTable('symptom', {
  symptomId: serial('symptom_id').primaryKey(),
  symptomText: text('symptom_text').notNull(),
}, (table) => [
  index('idx_symptom_text').on(table.symptomText),
]);

// STI_SYMPTOM junction
export const stiSymptom = pgTable('sti_symptom', {
  stiId: integer('sti_id').notNull().references(() => sti.stiId, { onDelete: 'cascade' }),
  symptomId: integer('symptom_id').notNull().references(() => symptom.symptomId, { onDelete: 'cascade' }),
  stiSymptomCategory: varchar('sti_symptom_category', { length: 50 }).default('general').notNull(), // common|men|women|general
}, (table) => [
  primaryKey({ columns: [table.stiId, table.symptomId] }),
  index('idx_sti_symptom_sti').on(table.stiId),
  index('idx_sti_symptom_symptom').on(table.symptomId),
  index('idx_sti_symptom_category').on(table.stiSymptomCategory),
]);

// TRANSMISSION dictionary
export const transmission = pgTable('transmission', {
  transmissionId: serial('transmission_id').primaryKey(),
  transmissionText: text('transmission_text').notNull(),
}, (table) => [
  index('idx_transmission_text').on(table.transmissionText),
]);

// STI_TRANSMISSION junction
export const stiTransmission = pgTable('sti_transmission', {
  stiId: integer('sti_id').notNull().references(() => sti.stiId, { onDelete: 'cascade' }),
  transmissionId: integer('transmission_id').notNull().references(() => transmission.transmissionId, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.stiId, table.transmissionId] }),
  index('idx_sti_transmission_sti').on(table.stiId),
  index('idx_sti_transmission_trans').on(table.transmissionId),
]);

// HEALTH_EFFECT dictionary
export const healthEffect = pgTable('health_effect', {
  healthEffectId: serial('health_effect_id').primaryKey(),
  healthEffectText: text('health_effect_text').notNull(),
}, (table) => [
  index('idx_health_effect_text').on(table.healthEffectText),
]);

// STI_HEALTH_EFFECT junction
export const stiHealthEffect = pgTable('sti_health_effect', {
  stiId: integer('sti_id').notNull().references(() => sti.stiId, { onDelete: 'cascade' }),
  healthEffectId: integer('health_effect_id').notNull().references(() => healthEffect.healthEffectId, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.stiId, table.healthEffectId] }),
  index('idx_sti_health_effect_sti').on(table.stiId),
  index('idx_sti_health_effect_he').on(table.healthEffectId),
]);

// PREVENTION dictionary
export const prevention = pgTable('prevention', {
  preventionId: serial('prevention_id').primaryKey(),
  preventionText: text('prevention_text').notNull(),
}, (table) => [
  index('idx_prevention_text').on(table.preventionText),
]);

// STI_PREVENTION junction
export const stiPrevention = pgTable('sti_prevention', {
  stiId: integer('sti_id').notNull().references(() => sti.stiId, { onDelete: 'cascade' }),
  preventionId: integer('prevention_id').notNull().references(() => prevention.preventionId, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.stiId, table.preventionId] }),
  index('idx_sti_prevention_sti').on(table.stiId),
  index('idx_sti_prevention_prev').on(table.preventionId),
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

// Newsletter subscriptions table
export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 320 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_newsletter_subscriptions_email').on(table.email),
]);

// AI scenario simulation persistence
export const aiScenarioSessions = pgTable('ai_scenario_sessions', {
  sessionId: varchar('session_id', { length: 128 }).primaryKey(),
  scenarioId: varchar('scenario_id', { length: 128 }).notNull(),
  scenarioTitle: varchar('scenario_title', { length: 255 }),
  scenarioSetting: varchar('scenario_setting', { length: 255 }),
  tensionLevel: varchar('tension_level', { length: 16 }),
  learningObjectives: jsonb('learning_objectives').notNull().default(sql`'[]'::jsonb`),
  supportingFacts: jsonb('supporting_facts').notNull().default(sql`'[]'::jsonb`),
  locale: varchar('locale', { length: 16 }),
  allowAutoEnd: boolean('allow_auto_end').notNull().default(true),
  npcId: varchar('npc_id', { length: 128 }).notNull(),
  npcName: varchar('npc_name', { length: 255 }).notNull(),
  npcRole: varchar('npc_role', { length: 255 }).notNull(),
  npcPersona: text('npc_persona'),
  npcGoals: jsonb('npc_goals').notNull().default(sql`'[]'::jsonb`),
  npcTactics: jsonb('npc_tactics').notNull().default(sql`'[]'::jsonb`),
  npcBoundaries: jsonb('npc_boundaries').notNull().default(sql`'[]'::jsonb`),
  lastSummaryRisk: varchar('last_summary_risk', { length: 16 }),
  lastScore: integer('last_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  completionReason: text('completion_reason'),
}, (table) => [
  index('idx_ai_scenario_sessions_created_at').on(table.createdAt),
  index('idx_ai_scenario_sessions_npc').on(table.npcId),
  index('idx_ai_scenario_sessions_scenario').on(table.scenarioId),
]);

export const aiScenarioTurns = pgTable('ai_scenario_turns', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 128 }).notNull().references(() => aiScenarioSessions.sessionId, { onDelete: 'cascade' }),
  turnIndex: integer('turn_index').notNull(),
  role: varchar('role', { length: 16 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_ai_scenario_turns_session').on(table.sessionId),
  index('idx_ai_scenario_turns_turn_index').on(table.turnIndex),
  uniqueIndex('uq_ai_scenario_turns_session_index').on(table.sessionId, table.turnIndex),
]);

export const aiScenarioResponses = pgTable('ai_scenario_responses', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 128 }).notNull().references(() => aiScenarioSessions.sessionId, { onDelete: 'cascade' }),
  playerTurnCount: integer('player_turn_count').notNull(),
  summaryDue: boolean('summary_due').notNull().default(false),
  assessmentDue: boolean('assessment_due').notNull().default(false),
  npcReply: text('npc_reply').notNull(),
  summary: jsonb('summary'),
  score: jsonb('score'),
  finalReport: jsonb('final_report'),
  safetyAlerts: jsonb('safety_alerts').notNull().default(sql`'[]'::jsonb`),
  conversationComplete: boolean('conversation_complete').notNull().default(false),
  conversationCompleteReason: text('conversation_complete_reason'),
  rawResponse: jsonb('raw_response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_ai_scenario_responses_session').on(table.sessionId),
  index('idx_ai_scenario_responses_player_turn_count').on(table.playerTurnCount),
  uniqueIndex('uq_ai_scenario_responses_session_turns').on(table.sessionId, table.playerTurnCount),
]);

// Legacy table kept temporarily for migration compatibility
// TODO: migrate data to `prevalence` and drop this table via migration
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
