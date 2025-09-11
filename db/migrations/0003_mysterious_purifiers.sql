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
CREATE INDEX "idx_quiz_stats_best_score" ON "quiz_leaderboard_stats" USING btree ("best_score");--> statement-breakpoint
CREATE INDEX "idx_quiz_stats_total_attempts" ON "quiz_leaderboard_stats" USING btree ("total_attempts");--> statement-breakpoint
CREATE INDEX "idx_quiz_stats_quiz_type" ON "quiz_leaderboard_stats" USING btree ("quiz_type");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_nickname" ON "quiz_results" USING btree ("nickname");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_score" ON "quiz_results" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_quiz_type" ON "quiz_results" USING btree ("quiz_type");--> statement-breakpoint
CREATE INDEX "idx_quiz_results_created_at" ON "quiz_results" USING btree ("created_at");