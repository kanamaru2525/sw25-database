DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = '"AccessoryUsage"'::regtype 
        AND enumlabel = 'NONE'
    ) THEN
        EXECUTE 'ALTER TYPE "AccessoryUsage" ADD VALUE ''NONE''';
    END IF;
END$$;
