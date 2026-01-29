SELECT enumlabel as value FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AccessoryUsage')
ORDER BY enumsortorder;
