-- Temporary default so the columns apply to existing rows; the seed upsert that runs after migrations writes the real values.
ALTER TABLE "classes" ADD COLUMN "allocation" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "allocation" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "classes" ADD COLUMN "derivation" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "classes" ALTER COLUMN "derivation" DROP DEFAULT;
