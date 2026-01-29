-- 確実にNONE値を追加
DO $$
BEGIN
    -- Check if NONE already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'AccessoryUsage' 
        AND e.enumlabel = 'NONE'
    ) THEN
        -- Add NONE value
        EXECUTE 'ALTER TYPE "AccessoryUsage" ADD VALUE ''NONE''';
        RAISE NOTICE 'Added NONE to AccessoryUsage';
    ELSE
        RAISE NOTICE 'NONE already exists in AccessoryUsage';
    END IF;
END$$;

-- Verify enum values
SELECT enumlabel as value 
FROM pg_enum 
WHERE enumtypid = '"AccessoryUsage"'::regtype 
ORDER BY enumsortorder;
