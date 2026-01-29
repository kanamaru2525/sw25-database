-- 既存のアイテムデータのregulationコードを新形式に移行
-- TYPE_I → Ⅰ などに変換

UPDATE "Weapon" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "Weapon" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "Weapon" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

UPDATE "Armor" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "Armor" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "Armor" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

UPDATE "Accessory" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "Accessory" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "Accessory" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

UPDATE "Spell" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "Spell" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "Spell" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

UPDATE "CombatFeat" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "CombatFeat" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "CombatFeat" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

UPDATE "SpecialSkill" SET regulation = 'Ⅰ' WHERE regulation = 'TYPE_I';
UPDATE "SpecialSkill" SET regulation = 'Ⅱ' WHERE regulation = 'TYPE_II';
UPDATE "SpecialSkill" SET regulation = 'Ⅲ' WHERE regulation = 'TYPE_III';

-- 確認用クエリ（コメントアウト）
-- SELECT DISTINCT regulation FROM "Weapon";
-- SELECT DISTINCT regulation FROM "Armor";
-- SELECT DISTINCT regulation FROM "Accessory";
-- SELECT DISTINCT regulation FROM "Spell";
-- SELECT DISTINCT regulation FROM "CombatFeat";
-- SELECT DISTINCT regulation FROM "SpecialSkill";
