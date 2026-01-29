-- 1. Check if AccessoryUsage enum type exists and its values
SELECT 
    'Enum AccessoryUsage values:' as check_type,
    enumlabel as value
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
ORDER BY enumsortorder;

-- 2. Check actual usage values in Accessory table
SELECT DISTINCT
    'Accessory table usage values:' as check_type,
    usage::text as value
FROM "Accessory"
ORDER BY usage::text;

-- 3. Check if there's a mismatch
SELECT 
    'Values in table but NOT in enum:' as check_type,
    usage::text as problematic_value
FROM "Accessory"
WHERE usage::text NOT IN (
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
)
GROUP BY usage::text;
