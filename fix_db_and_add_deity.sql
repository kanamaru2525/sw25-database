-- ItemType enum を作成（存在しない場合のみ）
DO $$ BEGIN
    CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'ACCESSORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- deity カラムを追加（存在しない場合のみ）
DO $$ BEGIN
    ALTER TABLE "Spell" ADD COLUMN "deity" TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
