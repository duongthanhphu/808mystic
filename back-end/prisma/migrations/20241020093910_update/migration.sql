-- AlterTable
ALTER TABLE "products" ADD COLUMN     "longDescription" VARCHAR(200),
ADD COLUMN     "shortDescription" VARCHAR(200);

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updatedAt" DROP NOT NULL;
