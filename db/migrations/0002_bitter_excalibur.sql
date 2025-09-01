CREATE TABLE "sti_info" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" varchar(20) NOT NULL,
	"treatability" varchar(20) NOT NULL,
	"symptoms_common" text NOT NULL,
	"symptoms_women" text NOT NULL,
	"symptoms_men" text NOT NULL,
	"symptoms_general" text NOT NULL,
	"transmission" text NOT NULL,
	"health_effects" text NOT NULL,
	"prevention" text NOT NULL,
	"treatment" text NOT NULL,
	"malaysian_context" text NOT NULL
);
--> statement-breakpoint
DROP INDEX "idx_std_state_date";--> statement-breakpoint
DROP INDEX "idx_std_state_state";--> statement-breakpoint
DROP INDEX "idx_std_state_disease";--> statement-breakpoint
CREATE INDEX "idx_sti_info_type" ON "sti_info" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_sti_info_severity" ON "sti_info" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_sti_state_date" ON "sti_state" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_sti_state_state" ON "sti_state" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_sti_state_disease" ON "sti_state" USING btree ("disease");