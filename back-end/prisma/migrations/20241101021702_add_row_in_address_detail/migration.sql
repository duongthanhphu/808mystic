/*
  Warnings:

  - Added the required column `addressDetail` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "addressDetail" VARCHAR(255) NOT NULL;
