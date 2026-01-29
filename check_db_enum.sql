-- 1. AccessoryUsage enumの値を確認
SELECT 
    'AccessoryUsage enum values:' as info,
    enumlabel as value,
    enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'AccessoryUsage'
)
ORDER BY enumsortorder;

-- 2. Accessoryテーブルのusage値の分布を確認
SELECT 
    'Accessory table usage distribution:' as info,
    usage,
    COUNT(*) as count
FROM "Accessory"
GROUP BY usage
ORDER BY usage;
