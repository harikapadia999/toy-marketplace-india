-- CreateEnum
CREATE TYPE "ToyCondition" AS ENUM ('new', 'like_new', 'good', 'fair');
CREATE TYPE "ToyStatus" AS ENUM ('available', 'sold', 'reserved');

-- CreateTable
CREATE TABLE "toys" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "condition" "ToyCondition" NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "ToyStatus" NOT NULL DEFAULT 'available',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "toys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toy_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "toyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toy_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT,
    "resultsCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "toys_title_idx" ON "toys"("title");
CREATE INDEX "toys_category_idx" ON "toys"("category");
CREATE INDEX "toys_ageGroup_idx" ON "toys"("ageGroup");
CREATE INDEX "toys_condition_idx" ON "toys"("condition");
CREATE INDEX "toys_price_idx" ON "toys"("price");
CREATE INDEX "toys_city_idx" ON "toys"("city");
CREATE INDEX "toys_state_idx" ON "toys"("state");
CREATE INDEX "toys_status_idx" ON "toys"("status");
CREATE INDEX "toys_sellerId_idx" ON "toys"("sellerId");
CREATE INDEX "toys_createdAt_idx" ON "toys"("createdAt");

-- Full-text search index
CREATE INDEX "toys_title_description_idx" ON "toys" USING GIN (to_tsvector('english', title || ' ' || description));

-- CreateIndex
CREATE INDEX "toy_images_toyId_idx" ON "toy_images"("toyId");

-- CreateIndex
CREATE INDEX "search_logs_query_idx" ON "search_logs"("query");
CREATE INDEX "search_logs_userId_idx" ON "search_logs"("userId");
CREATE INDEX "search_logs_createdAt_idx" ON "search_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "toys" ADD CONSTRAINT "toys_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "toy_images" ADD CONSTRAINT "toy_images_toyId_fkey" FOREIGN KEY ("toyId") REFERENCES "toys"("id") ON DELETE CASCADE ON UPDATE CASCADE;