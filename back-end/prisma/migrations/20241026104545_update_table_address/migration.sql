/*
  Warnings:

  - A unique constraint covering the columns `[userId,sellerId]` on the table `addresses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "addresses_userId_sellerId_key" ON "addresses"("userId", "sellerId");
