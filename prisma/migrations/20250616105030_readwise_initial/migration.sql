-- CreateTable
CREATE TABLE "readwise_books" (
    "id" SERIAL NOT NULL,
    "user_book_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "readable_title" TEXT,
    "source" TEXT NOT NULL,
    "cover_image_url" TEXT,
    "unique_url" TEXT,
    "category" TEXT NOT NULL,
    "document_note" TEXT,
    "summary" TEXT,
    "readwise_url" TEXT NOT NULL,
    "source_url" TEXT,
    "external_id" TEXT,
    "asin" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_highlight_at" TIMESTAMP(3),

    CONSTRAINT "readwise_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readwise_highlights" (
    "id" SERIAL NOT NULL,
    "readwise_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "location" INTEGER,
    "location_type" TEXT,
    "note" TEXT,
    "color" TEXT,
    "highlighted_at" TIMESTAMP(3),
    "url" TEXT,
    "end_location" INTEGER,
    "external_id" TEXT,
    "readwise_url" TEXT NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_discard" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "book_id" INTEGER NOT NULL,

    CONSTRAINT "readwise_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readwise_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readwise_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readwise_book_tags" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "readwise_book_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readwise_highlight_tags" (
    "id" SERIAL NOT NULL,
    "highlight_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "readwise_highlight_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readwise_sync_logs" (
    "id" SERIAL NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "book_count" INTEGER,
    "highlight_count" INTEGER,

    CONSTRAINT "readwise_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "readwise_books_user_book_id_key" ON "readwise_books"("user_book_id");

-- CreateIndex
CREATE UNIQUE INDEX "readwise_highlights_readwise_id_key" ON "readwise_highlights"("readwise_id");

-- CreateIndex
CREATE UNIQUE INDEX "readwise_tags_name_key" ON "readwise_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "readwise_book_tags_book_id_tag_id_key" ON "readwise_book_tags"("book_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "readwise_highlight_tags_highlight_id_tag_id_key" ON "readwise_highlight_tags"("highlight_id", "tag_id");

-- AddForeignKey
ALTER TABLE "readwise_highlights" ADD CONSTRAINT "readwise_highlights_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "readwise_books"("user_book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readwise_book_tags" ADD CONSTRAINT "readwise_book_tags_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "readwise_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readwise_book_tags" ADD CONSTRAINT "readwise_book_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "readwise_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readwise_highlight_tags" ADD CONSTRAINT "readwise_highlight_tags_highlight_id_fkey" FOREIGN KEY ("highlight_id") REFERENCES "readwise_highlights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readwise_highlight_tags" ADD CONSTRAINT "readwise_highlight_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "readwise_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
