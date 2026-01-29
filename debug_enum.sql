DO $$
BEGIN
    -- AccessoryUsage enumの正確な名前を確認
    RAISE NOTICE 'Checking for AccessoryUsage enum...';
    
    -- すべてのenum型を表示
    RAISE NOTICE 'All enum types:';
    FOR r IN 
        SELECT t.typname
        FROM pg_type t
        WHERE t.typtype = 'e'
        ORDER BY t.typname
    LOOP
        RAISE NOTICE '  - %', r.typname;
    END LOOP;
    
    -- AccessoryUsageの値を表示
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AccessoryUsage') THEN
        RAISE NOTICE 'AccessoryUsage values:';
        FOR r IN 
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = 'AccessoryUsage'::regtype 
            ORDER BY enumsortorder
        LOOP
            RAISE NOTICE '  - %', r.enumlabel;
        END LOOP;
    ELSE
        RAISE NOTICE 'AccessoryUsage enum does NOT exist!';
    END IF;
END $$;
