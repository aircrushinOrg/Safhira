CREATE TABLE "provider" (
	"provider_id" serial PRIMARY KEY NOT NULL,
	"state_id" integer NOT NULL,
	"provider_name" varchar(255) NOT NULL,
	"provider_address" text NOT NULL,
	"provider_phone_num" varchar(50),
	"provider_email" varchar(255),
	"provider_longitude" numeric(9, 6),
	"provider_latitude" numeric(9, 6),
	"provider_provide_prep" boolean DEFAULT false NOT NULL,
	"provider_provide_pep" boolean DEFAULT false NOT NULL,
	"provider_free_sti_screening" boolean DEFAULT false NOT NULL,
	"provider_google_place_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "provider" ADD CONSTRAINT "provider_state_id_state_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."state"("state_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_provider_state" ON "provider" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_provider_name" ON "provider" USING btree ("provider_name");