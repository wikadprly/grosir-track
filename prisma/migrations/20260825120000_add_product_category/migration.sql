-- AlterTable
ALTER TABLE "Product" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");
