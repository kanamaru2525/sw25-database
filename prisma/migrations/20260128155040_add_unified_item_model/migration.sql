-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'ACCESSORY');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "rank" "Rank",
    "usage" TEXT,
    "minStrength" INTEGER,
    "hit" INTEGER,
    "power" INTEGER,
    "critical" INTEGER,
    "extraDamage" INTEGER,
    "range" INTEGER,
    "evasion" INTEGER,
    "defense" INTEGER,
    "price" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_itemType_idx" ON "Item"("itemType");

-- CreateIndex
CREATE INDEX "Item_regulation_idx" ON "Item"("regulation");

-- Migrate data from Weapon
INSERT INTO "Item" (
    "id", "itemType", "name", "category", "rank", "usage", "minStrength",
    "hit", "power", "critical", "extraDamage", "range",
    "price", "summary", "page", "regulation"
)
SELECT 
    id, 'WEAPON'::ItemType, name, category, rank, usage, "minStrength",
    hit, power, critical, "extraDamage", range,
    price, summary, page, regulation
FROM "Weapon";

-- Migrate data from Armor
INSERT INTO "Item" (
    "id", "itemType", "name", "category", "rank", "usage", "minStrength",
    "evasion", "defense",
    "price", "summary", "page", "regulation"
)
SELECT 
    id, 'ARMOR'::ItemType, name, category, rank, usage, "minStrength",
    evasion, defense,
    price, summary, page, regulation
FROM "Armor";

-- Migrate data from Accessory  
INSERT INTO "Item" (
    "id", "itemType", "name", "usage",
    "price", "summary", "page", "regulation"
)
SELECT 
    id, 'ACCESSORY'::ItemType, name, usage::text,
    price, summary, page, regulation
FROM "Accessory";
