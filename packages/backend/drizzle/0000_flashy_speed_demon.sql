CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"base_stats" jsonb NOT NULL,
	"points_per_level" integer NOT NULL,
	"max_level" integer NOT NULL,
	"weapon_types" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"class_id" text NOT NULL,
	"type" text NOT NULL,
	"rarity" text NOT NULL,
	"item_level" integer NOT NULL,
	"talent_requirement" integer,
	"weight" real NOT NULL,
	"physical_atk" integer,
	"magic_atk" integer,
	"damage_share" jsonb NOT NULL,
	"stagger_trigger" real NOT NULL,
	"exhaust_trigger" real NOT NULL,
	"lunastone" text,
	"extra_stat" text,
	"tempering" jsonb NOT NULL,
	"how_to_get" text NOT NULL,
	"notes" text,
	"sources" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weapons" ADD CONSTRAINT "weapons_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "weapons_class_id_type_idx" ON "weapons" USING btree ("class_id","type");