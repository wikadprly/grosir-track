-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "clientRef" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "clientRef" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_clientRef_key" ON "Payment"("clientRef");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_clientRef_key" ON "Transaction"("clientRef");
