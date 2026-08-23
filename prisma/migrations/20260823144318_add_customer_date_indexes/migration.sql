-- CreateIndex
CREATE INDEX "Payment_customerId_date_idx" ON "Payment"("customerId", "date");

-- CreateIndex
CREATE INDEX "Transaction_customerId_date_idx" ON "Transaction"("customerId", "date");
