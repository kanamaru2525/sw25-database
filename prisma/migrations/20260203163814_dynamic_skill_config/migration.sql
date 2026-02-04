/*
  Warnings:

  - The `regulations` column on the `RegulationPreset` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `category` on the `SpecialSkill` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `SpecialSkill` table. All the data in the column will be lost.
  - You are about to drop the `Accessory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Armor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Weapon` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `regulation` on the `CombatFeat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `regulation` on the `Item` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `categoryCode` to the `SpecialSkill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `regulation` on the `SpecialSkill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `regulation` on the `Spell` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "CombatFeat" ADD COLUMN     "vagrancy" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "regulation",
ADD COLUMN     "regulation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "regulation",
ADD COLUMN     "regulation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RegulationPreset" DROP COLUMN "regulations",
ADD COLUMN     "regulations" TEXT[];

-- AlterTable
ALTER TABLE "SpecialSkill" DROP COLUMN "category",
DROP COLUMN "details",
ADD COLUMN     "categoryCode" TEXT NOT NULL,
ADD COLUMN     "customFields" JSONB,
ALTER COLUMN "level" DROP NOT NULL,
DROP COLUMN "regulation",
ADD COLUMN     "regulation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "deity" TEXT,
DROP COLUMN "regulation",
ADD COLUMN     "regulation" TEXT NOT NULL;

-- DropTable
DROP TABLE "Accessory";

-- DropTable
DROP TABLE "Armor";

-- DropTable
DROP TABLE "Weapon";

-- DropEnum
DROP TYPE "AccessoryUsage";

-- DropEnum
DROP TYPE "RegulationType";

-- DropEnum
DROP TYPE "SkillCategory";

-- CreateTable
CREATE TABLE "SkillCategoryConfig" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillCategoryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillFieldConfig" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fieldLabel" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "placeholder" TEXT,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillFieldConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulationConfig" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegulationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategoryConfig_code_key" ON "SkillCategoryConfig"("code");

-- CreateIndex
CREATE INDEX "SkillCategoryConfig_order_idx" ON "SkillCategoryConfig"("order");

-- CreateIndex
CREATE INDEX "SkillFieldConfig_categoryId_order_idx" ON "SkillFieldConfig"("categoryId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SkillFieldConfig_categoryId_fieldKey_key" ON "SkillFieldConfig"("categoryId", "fieldKey");

-- CreateIndex
CREATE UNIQUE INDEX "Deity_name_key" ON "Deity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RegulationConfig_code_key" ON "RegulationConfig"("code");

-- CreateIndex
CREATE INDEX "Item_regulation_idx" ON "Item"("regulation");

-- CreateIndex
CREATE INDEX "SpecialSkill_categoryCode_idx" ON "SpecialSkill"("categoryCode");

-- CreateIndex
CREATE INDEX "SpecialSkill_regulation_idx" ON "SpecialSkill"("regulation");

-- AddForeignKey
ALTER TABLE "SkillFieldConfig" ADD CONSTRAINT "SkillFieldConfig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategoryConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialSkill" ADD CONSTRAINT "SpecialSkill_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "SkillCategoryConfig"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
