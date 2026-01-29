-- AccessoryUsageの実際の名前を確認
SELECT 
    n.nspname AS schema_name,
    t.typname AS enum_name
FROM pg_type t
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typtype = 'e'
  AND n.nspname = 'public'
  AND t.typname LIKE '%ccessory%'
ORDER BY t.typname;
