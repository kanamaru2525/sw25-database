-- CreateEnum
CREATE TYPE "AccessoryUsage" AS ENUM ('ONE_HAND', 'TWO_HANDS', 'HEAD', 'FACE', 'EAR', 'NECK', 'BACK', 'HAND', 'WAIST', 'FOOT', 'ANY');

-- Update NULL values to default
UPDATE "Accessory" SET "usage" = '任意' WHERE "usage" IS NULL;

-- AlterTable: Change usage column type with data mapping
ALTER TABLE "Accessory" 
  ALTER COLUMN "usage" TYPE "AccessoryUsage" 
  USING (
    CASE 
      WHEN "usage" = '1H' THEN 'ONE_HAND'::"AccessoryUsage"
      WHEN "usage" = '2H' THEN 'TWO_HANDS'::"AccessoryUsage"
      WHEN "usage" = '頭' THEN 'HEAD'::"AccessoryUsage"
      WHEN "usage" = '顔' THEN 'FACE'::"AccessoryUsage"
      WHEN "usage" = '耳' THEN 'EAR'::"AccessoryUsage"
      WHEN "usage" = '首' THEN 'NECK'::"AccessoryUsage"
      WHEN "usage" = '背中' THEN 'BACK'::"AccessoryUsage"
      WHEN "usage" = '手' THEN 'HAND'::"AccessoryUsage"
      WHEN "usage" = '腰' THEN 'WAIST'::"AccessoryUsage"
      WHEN "usage" = '足' THEN 'FOOT'::"AccessoryUsage"
      WHEN "usage" = '任意' THEN 'ANY'::"AccessoryUsage"
      ELSE 'ANY'::"AccessoryUsage"
    END
  );
