/*
  Warnings:

  - You are about to drop the column `attributeId` on the `attribute_values` table. All the data in the column will be lost.
  - Added the required column `categoryAttributeValueId` to the `attribute_values` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attribute_values" DROP CONSTRAINT "attribute_values_attributeId_fkey";

-- AlterTable
ALTER TABLE "attribute_values" DROP COLUMN "attributeId",
ADD COLUMN     "categoryAttributeValueId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_categoryAttributeValueId_fkey" FOREIGN KEY ("categoryAttributeValueId") REFERENCES "category_attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
