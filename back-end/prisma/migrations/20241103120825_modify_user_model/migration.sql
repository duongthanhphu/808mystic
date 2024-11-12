/*
  Warnings:

  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `districtCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `provinceCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wardCode` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "districtCode",
DROP COLUMN "provinceCode",
DROP COLUMN "wardCode";
