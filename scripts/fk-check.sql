SELECT conname, confdeltype
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conname;
