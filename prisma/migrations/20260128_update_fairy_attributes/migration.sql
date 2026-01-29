-- 妖精魔法の属性情報を更新
-- 土の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['土']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%土の妖精魔法%';

-- 水氷の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['水氷']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%水氷の妖精魔法%';

-- 火の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['火']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%火の妖精魔法%';

-- 風の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['風']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%風の妖精魔法%';

-- 光の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['光']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%光の妖精魔法%';

-- 闇の妖精魔法
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY['闇']::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%闇の妖精魔法%';

-- 基本妖精魔法は空配列（全属性共通）
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY[]::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%基本妖精魔法%';

-- 特殊妖精魔法も空配列（全属性契約が必要）
UPDATE "Spell" 
SET "fairyAttributes" = ARRAY[]::text[]
WHERE "type" = 'YOSEI' AND "name" LIKE '%特殊妖精魔法%';
