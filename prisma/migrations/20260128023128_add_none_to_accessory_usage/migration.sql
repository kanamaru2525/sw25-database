-- AlterEnum: Add NONE to AccessoryUsage enum
ALTER TYPE "AccessoryUsage" ADD VALUE IF NOT EXISTS 'NONE';
