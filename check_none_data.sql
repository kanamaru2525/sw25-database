-- Count accessories with NONE usage
SELECT COUNT(*) as none_count
FROM "Accessory"
WHERE usage = 'NONE';

-- Show all distinct usage values
SELECT DISTINCT usage::text as usage_value, COUNT(*) as count
FROM "Accessory"
GROUP BY usage::text
ORDER BY count DESC;
