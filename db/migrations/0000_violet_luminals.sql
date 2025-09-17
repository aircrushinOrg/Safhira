CREATE TABLE "health_effect" (
	"health_effect_id" serial PRIMARY KEY NOT NULL,
	"health_effect_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prevention" (
	"prevention_id" serial PRIMARY KEY NOT NULL,
	"prevention_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_leaderboard_stats" (
	"nickname" varchar(100) PRIMARY KEY NOT NULL,
	"best_score" integer DEFAULT 0 NOT NULL,
	"average_score" numeric(5, 2) DEFAULT '0' NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"quiz_type" varchar(50) DEFAULT 'myths' NOT NULL,
	"last_played_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"statement" text NOT NULL,
	"is_true" boolean NOT NULL,
	"explanation" text NOT NULL,
	"category" varchar(50) DEFAULT 'myths' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"nickname" varchar(100) NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer DEFAULT 5 NOT NULL,
	"correct_answers" integer NOT NULL,
	"quiz_type" varchar(50) DEFAULT 'myths' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sti" (
	"sti_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"treatability" varchar(20) NOT NULL,
	"treatment" text NOT NULL,
	"malaysian_context" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sti_health_effect" (
	"sti_id" integer NOT NULL,
	"health_effect_id" integer NOT NULL,
	CONSTRAINT "sti_health_effect_sti_id_health_effect_id_pk" PRIMARY KEY("sti_id","health_effect_id")
);
--> statement-breakpoint
CREATE TABLE "sti_prevention" (
	"sti_id" integer NOT NULL,
	"prevention_id" integer NOT NULL,
	CONSTRAINT "sti_prevention_sti_id_prevention_id_pk" PRIMARY KEY("sti_id","prevention_id")
);
--> statement-breakpoint
CREATE TABLE "sti_state" (
	"date" integer NOT NULL,
	"state" varchar(255) NOT NULL,
	"disease" varchar(255) NOT NULL,
	"cases" integer NOT NULL,
	"incidence" numeric(10, 2) NOT NULL,
	CONSTRAINT "sti_state_date_state_disease_pk" PRIMARY KEY("date","state","disease")
);
--> statement-breakpoint
CREATE TABLE "sti_symptom" (
	"sti_id" integer NOT NULL,
	"symptom_id" integer NOT NULL,
	"sti_symptom_category" varchar(50) DEFAULT 'general' NOT NULL,
	CONSTRAINT "sti_symptom_sti_id_symptom_id_pk" PRIMARY KEY("sti_id","symptom_id")
);
--> statement-breakpoint
CREATE TABLE "sti_transmission" (
	"sti_id" integer NOT NULL,
	"transmission_id" integer NOT NULL,
	CONSTRAINT "sti_transmission_sti_id_transmission_id_pk" PRIMARY KEY("sti_id","transmission_id")
);
--> statement-breakpoint
CREATE TABLE "symptom" (
	"symptom_id" serial PRIMARY KEY NOT NULL,
	"symptom_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transmission" (
	"transmission_id" serial PRIMARY KEY NOT NULL,
	"transmission_text" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_health_effect_text" ON "health_effect" USING btree ("health_effect_text");--> statement-breakpoint
CREATE INDEX "idx_prevention_text" ON "prevention" USING btree ("prevention_text");--> statement-breakpoint
CREATE INDEX "idx_quiz_stats_best_score" ON "quiz_leaderboard_stats" USING btree ("best_score");--> statement-breakpoint
CREATE INDEX "idx_quiz_stats_total_attempts" ON "quiz_leaderboard_stats" USING btree ("total_attempts");--> statement-breakpoint
CREATE INDEX "idx_quiz_stats_quiz_type" ON "quiz_leaderboard_stats" USING btree ("quiz_type");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_category" ON "quiz_questions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_nickname" ON "quiz_results" USING btree ("nickname");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_score" ON "quiz_results" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_quiz_type" ON "quiz_results" USING btree ("quiz_type");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_created_at" ON "quiz_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_sti_type" ON "sti" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_sti_severity" ON "sti" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_sti_name" ON "sti" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_sti_health_effect_sti" ON "sti_health_effect" USING btree ("sti_id");--> statement-breakpoint
CREATE INDEX "idx_sti_health_effect_he" ON "sti_health_effect" USING btree ("health_effect_id");--> statement-breakpoint
CREATE INDEX "idx_sti_prevention_sti" ON "sti_prevention" USING btree ("sti_id");--> statement-breakpoint
CREATE INDEX "idx_sti_prevention_prev" ON "sti_prevention" USING btree ("prevention_id");--> statement-breakpoint
CREATE INDEX "idx_sti_state_date" ON "sti_state" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_sti_state_state" ON "sti_state" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_sti_state_disease" ON "sti_state" USING btree ("disease");--> statement-breakpoint
CREATE INDEX "idx_sti_symptom_sti" ON "sti_symptom" USING btree ("sti_id");--> statement-breakpoint
CREATE INDEX "idx_sti_symptom_symptom" ON "sti_symptom" USING btree ("symptom_id");--> statement-breakpoint
CREATE INDEX "idx_sti_symptom_category" ON "sti_symptom" USING btree ("sti_symptom_category");--> statement-breakpoint
CREATE INDEX "idx_sti_transmission_sti" ON "sti_transmission" USING btree ("sti_id");--> statement-breakpoint
CREATE INDEX "idx_sti_transmission_trans" ON "sti_transmission" USING btree ("transmission_id");--> statement-breakpoint
CREATE INDEX "idx_symptom_text" ON "symptom" USING btree ("symptom_text");--> statement-breakpoint
CREATE INDEX "idx_transmission_text" ON "transmission" USING btree ("transmission_text");