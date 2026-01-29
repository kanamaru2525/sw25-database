-- 神聖魔法の神フィールドを追加
ALTER TABLE "Spell" ADD COLUMN "deity" TEXT;

-- 既存の神聖魔法データを確認するためのクエリ
-- SELECT name, type, level, deity FROM "Spell" WHERE type = 'SHINSEI';
