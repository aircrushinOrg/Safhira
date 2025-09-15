CREATE TABLE "prevalence" (
	"sti_id" integer NOT NULL,
	"state_id" integer NOT NULL,
	"prevalence_year" integer NOT NULL,
	"prevalence_cases" integer NOT NULL,
	"prevalence_incidence" numeric(10, 2) NOT NULL,
	CONSTRAINT "prevalence_sti_id_state_id_pk" PRIMARY KEY("sti_id","state_id")
);
--> statement-breakpoint
CREATE TABLE "state" (
	"state_id" serial PRIMARY KEY NOT NULL,
	"state_name" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prevalence" ADD CONSTRAINT "prevalence_sti_id_sti_sti_id_fk" FOREIGN KEY ("sti_id") REFERENCES "public"."sti"("sti_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prevalence" ADD CONSTRAINT "prevalence_state_id_state_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."state"("state_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_prevalence_year" ON "prevalence" USING btree ("prevalence_year");--> statement-breakpoint
CREATE INDEX "idx_prevalence_state" ON "prevalence" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_prevalence_sti" ON "prevalence" USING btree ("sti_id");--> statement-breakpoint
CREATE INDEX "idx_state_name" ON "state" USING btree ("state_name");