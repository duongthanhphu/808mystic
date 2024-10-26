/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingDistrict` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingProvince` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingWard` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingWardCode` on the `orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "addresses_userId_sellerId_key";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "shippingAddress",
DROP COLUMN "shippingDistrict",
DROP COLUMN "shippingProvince",
DROP COLUMN "shippingWard",
DROP COLUMN "shippingWardCode",
ADD COLUMN     "shippingAddressId" INTEGER;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "longDescription" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
