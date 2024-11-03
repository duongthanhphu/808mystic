-- DropForeignKey
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_sellerId_fkey";

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
