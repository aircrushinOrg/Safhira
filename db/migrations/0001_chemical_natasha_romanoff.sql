CREATE TABLE "sti_state" (
	"date" integer NOT NULL,
	"state" varchar(255) NOT NULL,
	"disease" varchar(255) NOT NULL,
	"cases" integer NOT NULL,
	"incidence" numeric(10, 2) NOT NULL,
	CONSTRAINT "sti_state_date_state_disease_pk" PRIMARY KEY("date","state","disease")
);
--> statement-breakpoint
CREATE INDEX "idx_std_state_date" ON "sti_state" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_std_state_state" ON "sti_state" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_std_state_disease" ON "sti_state" USING btree ("disease");