CREATE TABLE "readwise_book_tags" (
	"book_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "readwise_book_tags_book_id_tag_id_pk" PRIMARY KEY("book_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "readwise_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"readwise_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"readable_title" text,
	"source" text NOT NULL,
	"category" text NOT NULL,
	"cover_image_url" text,
	"source_url" text,
	"readwise_url" text NOT NULL,
	"unique_url" text,
	"document_note" text,
	"summary" text,
	"asin" text,
	"external_id" text,
	"highlight_count" integer DEFAULT 0 NOT NULL,
	"last_highlight_at" timestamp with time zone,
	"readwise_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "readwise_books_readwise_id_unique" UNIQUE("readwise_id"),
	CONSTRAINT "readwise_books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "readwise_highlight_tags" (
	"highlight_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "readwise_highlight_tags_highlight_id_tag_id_pk" PRIMARY KEY("highlight_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "readwise_highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"readwise_id" integer NOT NULL,
	"book_id" integer NOT NULL,
	"text" text NOT NULL,
	"note" text,
	"location" integer,
	"location_type" text,
	"color" text,
	"highlighted_at" timestamp with time zone,
	"url" text,
	"end_location" integer,
	"external_id" text,
	"readwise_url" text NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"readwise_created_at" timestamp with time zone,
	"readwise_updated_at" timestamp with time zone,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "readwise_highlights_readwise_id_unique" UNIQUE("readwise_id")
);
--> statement-breakpoint
CREATE TABLE "readwise_sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text NOT NULL,
	"trigger" text NOT NULL,
	"message" text,
	"book_count" integer,
	"highlight_count" integer,
	"removed_book_count" integer
);
--> statement-breakpoint
CREATE TABLE "readwise_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "readwise_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "readwise_book_tags" ADD CONSTRAINT "readwise_book_tags_book_id_readwise_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."readwise_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readwise_book_tags" ADD CONSTRAINT "readwise_book_tags_tag_id_readwise_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."readwise_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readwise_highlight_tags" ADD CONSTRAINT "readwise_highlight_tags_highlight_id_readwise_highlights_id_fk" FOREIGN KEY ("highlight_id") REFERENCES "public"."readwise_highlights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readwise_highlight_tags" ADD CONSTRAINT "readwise_highlight_tags_tag_id_readwise_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."readwise_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "readwise_highlights" ADD CONSTRAINT "readwise_highlights_book_id_readwise_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."readwise_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "readwise_book_tags_tag_id_idx" ON "readwise_book_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "readwise_books_last_highlight_at_idx" ON "readwise_books" USING btree ("last_highlight_at");--> statement-breakpoint
CREATE INDEX "readwise_highlight_tags_tag_id_idx" ON "readwise_highlight_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "readwise_highlights_book_id_idx" ON "readwise_highlights" USING btree ("book_id");