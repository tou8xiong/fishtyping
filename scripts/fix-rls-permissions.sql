-- Fix Row Level Security (RLS) for passages table
-- Run this in your Supabase SQL Editor

-- Enable RLS on passages table (if not already enabled)
ALTER TABLE passages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to passages" ON passages;
DROP POLICY IF EXISTS "Allow authenticated users to read passages" ON passages;

-- Create policy to allow everyone to read passages
CREATE POLICY "Allow public read access to passages"
ON passages
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users to update passage stats
CREATE POLICY "Allow authenticated users to update passages"
ON passages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'passages';
