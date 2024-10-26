-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingDistrict" TEXT,
ADD COLUMN     "shippingProvince" TEXT,
ADD COLUMN     "shippingWard" TEXT,
ADD COLUMN     "shippingWardCode" TEXT;
