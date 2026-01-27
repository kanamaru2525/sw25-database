/*
  Warnings:

  - The `magisphere` column on the `Spell` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MagisphereSize" AS ENUM ('LARGE', 'MEDIUM', 'SMALL');

-- AlterTable
ALTER TABLE "Spell" DROP COLUMN "magisphere",
ADD COLUMN     "magisphere" "MagisphereSize";
