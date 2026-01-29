-- Check if migration table exists and show applied migrations
SELECT migration_name, finished_at
FROM "_prisma_migrations"
WHERE migration_name LIKE '%accessory%'
ORDER BY finished_at DESC;
