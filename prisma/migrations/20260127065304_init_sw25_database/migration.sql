-- CreateEnum
CREATE TYPE "RegulationType" AS ENUM ('Ⅰ', 'Ⅱ', 'Ⅲ', 'DX', 'ET', 'ML', 'MA', 'BM', 'AL', 'RL', 'BR', 'BS', 'AB', 'BI', 'DD', 'US', 'TS');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('B', 'A', 'S', 'SS');

-- CreateEnum
CREATE TYPE "SpellType" AS ENUM ('SHINGO', 'SOREI', 'SHINCHI', 'SHINSEI', 'MADOKI', 'YOSEI', 'SHINRA', 'SHOI', 'NARAKU', 'HIOU');

-- CreateEnum
CREATE TYPE "FeatType" AS ENUM ('PASSIVE', 'MAJOR', 'DECLARATION');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('ENHANCER', 'BARD_SONG', 'BARD_FINALE', 'RIDER', 'ALCHEMIST', 'GEOMANCER', 'WARLEADER_KOUHAI', 'WARLEADER_JINRITSU', 'DARKHUNTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "discordId" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "RegulationPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "regulations" "RegulationType"[],

    CONSTRAINT "RegulationPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SpellType" NOT NULL,
    "level" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "shape" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "resistance" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "attribute" TEXT,
    "fairyAttributes" TEXT[],
    "biblioRank" INTEGER,
    "summary" TEXT NOT NULL,
    "magisphere" BOOLEAN NOT NULL DEFAULT false,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "usage" TEXT NOT NULL,
    "minStrength" INTEGER NOT NULL,
    "hit" INTEGER NOT NULL DEFAULT 0,
    "power" INTEGER NOT NULL,
    "critical" INTEGER NOT NULL DEFAULT 10,
    "extraDamage" INTEGER NOT NULL DEFAULT 0,
    "range" INTEGER,
    "price" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "Weapon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Armor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rank" "Rank" NOT NULL,
    "usage" TEXT NOT NULL,
    "minStrength" INTEGER NOT NULL,
    "evasion" INTEGER NOT NULL DEFAULT 0,
    "defense" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "Armor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CombatFeat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeatType" NOT NULL,
    "requirement" TEXT,
    "target" TEXT,
    "risk" TEXT,
    "summary" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "CombatFeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialSkill" (
    "id" TEXT NOT NULL,
    "category" "SkillCategory" NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "duration" TEXT,
    "resistance" TEXT,
    "cost" TEXT,
    "attribute" TEXT,
    "target" TEXT,
    "rangeShape" TEXT,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "page" TEXT NOT NULL,
    "regulation" "RegulationType" NOT NULL,

    CONSTRAINT "SpecialSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegulationPreset" ADD CONSTRAINT "RegulationPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
