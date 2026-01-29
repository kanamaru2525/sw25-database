-- SkillCategoryConfigテーブルにカテゴリーを挿入

INSERT INTO "SkillCategoryConfig" (id, code, name, "order")
VALUES 
  (gen_random_uuid(), 'ENHANCER', '練技', 1),
  (gen_random_uuid(), 'BARD_SONG', '呪歌', 2),
  (gen_random_uuid(), 'BARD_SONG_FINALE', '終律', 3),
  (gen_random_uuid(), 'RIDER', '騎芸', 4),
  (gen_random_uuid(), 'ALCHEMIST', '賦術', 5),
  (gen_random_uuid(), 'GEOMANCER', '鎮域', 6),
  (gen_random_uuid(), 'WARLEADER_KOUHAI', '鼓吠', 7),
  (gen_random_uuid(), 'WARLEADER_JINRITSU', '陣律', 8),
  (gen_random_uuid(), 'DARKHUNTER', '相域', 9)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  "order" = EXCLUDED."order";
