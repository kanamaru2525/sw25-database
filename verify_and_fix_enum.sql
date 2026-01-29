-- Check if AccessoryUsage enum has NONE value
DO $$
DECLARE
    enum_exists boolean;
    none_exists boolean;
    r record;
BEGIN
    -- Check if AccessoryUsage type exists
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'AccessoryUsage'
    ) INTO enum_exists;
    
    IF enum_exists THEN
        RAISE NOTICE 'AccessoryUsage enum EXISTS';
        
        -- List all values
        FOR r IN 
            SELECT enumlabel, enumsortorder
            FROM pg_enum
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
            ORDER BY enumsortorder
        LOOP
            RAISE NOTICE '  [%] %', r.enumsortorder, r.enumlabel;
        END LOOP;
        
        -- Check if NONE exists
        SELECT EXISTS (
            SELECT 1 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
            AND enumlabel = 'NONE'
        ) INTO none_exists;
        
        IF none_exists THEN
            RAISE NOTICE 'NONE value EXISTS in enum';
        ELSE
            RAISE NOTICE 'NONE value DOES NOT EXIST in enum - ADDING IT NOW';
            ALTER TYPE "AccessoryUsage" ADD VALUE IF NOT EXISTS 'NONE';
            RAISE NOTICE 'NONE value added successfully';
        END IF;
    ELSE
        RAISE NOTICE 'AccessoryUsage enum DOES NOT EXIST';
    END IF;
END $$;
