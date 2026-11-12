CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"recipe_id" text NOT NULL,
	"material_id" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "recipe_ingredients_recipe_id_material_id_pk" PRIMARY KEY("recipe_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"output_material_id" text NOT NULL,
	"output_quantity" integer NOT NULL,
	"station" text NOT NULL,
	"profession" text NOT NULL,
	"profession_level" integer NOT NULL,
	"gold_cost" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_output_material_id_materials_id_fk" FOREIGN KEY ("output_material_id") REFERENCES "public"."materials"("id") ON DELETE no action ON UPDATE no action;