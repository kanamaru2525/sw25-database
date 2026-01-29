-- Check 1: Does AccessoryUsage enum exist in database?
SELECT typname FROM pg_type WHERE typname = 'AccessoryUsage';

-- Check 2: What values are in the enum?
SELECT e.enumlabel, e.enumsortorder
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'AccessoryUsage'
ORDER BY e.enumsortorder;

-- Check 3: What values are actually in the Accessory table?
SELECT DISTINCT usage::text, COUNT(*) 
FROM "Accessory" 
GROUP BY usage::text 
ORDER BY COUNT(*) DESC;
