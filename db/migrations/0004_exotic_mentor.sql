CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"statement" text NOT NULL,
	"is_true" boolean NOT NULL,
	"explanation" text NOT NULL,
	"category" varchar(50) DEFAULT 'myths' NOT NULL,
	"difficulty" varchar(20) DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_category" ON "quiz_questions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_difficulty" ON "quiz_questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_quiz_questions_is_active" ON "quiz_questions" USING btree ("is_active");