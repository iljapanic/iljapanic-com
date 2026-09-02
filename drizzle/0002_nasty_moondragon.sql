CREATE TABLE "book_section_items" (
	"section_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "book_section_items_section_id_book_id_pk" PRIMARY KEY("section_id","book_id")
);
--> statement-breakpoint
CREATE TABLE "book_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"url" text NOT NULL,
	"cover_url" text,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tool_section_items" (
	"section_id" integer NOT NULL,
	"tool_id" integer NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "tool_section_items_section_id_tool_id_pk" PRIMARY KEY("section_id","tool_id")
);
--> statement-breakpoint
CREATE TABLE "tool_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"simple_icon_slug" text,
	"icon_url" text,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "book_section_items" ADD CONSTRAINT "book_section_items_section_id_book_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."book_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_section_items" ADD CONSTRAINT "book_section_items_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_section_items" ADD CONSTRAINT "tool_section_items_section_id_tool_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."tool_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_section_items" ADD CONSTRAINT "tool_section_items_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;