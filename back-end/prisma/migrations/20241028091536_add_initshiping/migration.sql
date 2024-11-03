/*
  Warnings:

  - You are about to drop the column `ghtkShopCreatedAt` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `ghtkShopId` on the `sellers` table. All the data in the column will be lost.
  - You are about to drop the column `ghtkToken` on the `sellers` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ShippingProviderStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- DropIndex
DROP INDEX "sellers_ghtkShopId_key";

-- AlterTable
ALTER TABLE "sellers" DROP COLUMN "ghtkShopCreatedAt",
DROP COLUMN "ghtkShopId",
DROP COLUMN "ghtkToken";

-- CreateTable
CREATE TABLE "shipping_providers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "website" VARCHAR(255),
    "apiEndpoint" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "policies" TEXT,
    "status" "ShippingProviderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shipping_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_shipping_configs" (
    "id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "shippingProviderId" INTEGER NOT NULL,
    "shopId" VARCHAR(100) NOT NULL,
    "token" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "seller_shipping_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_providers_code_key" ON "shipping_providers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "seller_shipping_configs_sellerId_shippingProviderId_key" ON "seller_shipping_configs"("sellerId", "shippingProviderId");

-- AddForeignKey
ALTER TABLE "seller_shipping_configs" ADD CONSTRAINT "seller_shipping_configs_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_shipping_configs" ADD CONSTRAINT "seller_shipping_configs_shippingProviderId_fkey" FOREIGN KEY ("shippingProviderId") REFERENCES "shipping_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
