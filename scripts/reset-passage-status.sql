-- Reset all passages to 'ready' status
-- Run this in your Supabase SQL Editor

UPDATE passages
SET status = 'ready'
WHERE status = 'in_use';

-- Verify the fix
SELECT status, COUNT(*) as count
FROM passages
GROUP BY status;
