-- Alternative: Disable RLS completely for passages table (simpler but less secure)
-- Run this ONLY if the above RLS policies don't work

ALTER TABLE passages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'passages';
