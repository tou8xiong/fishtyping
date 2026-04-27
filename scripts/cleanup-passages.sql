-- Cleanup script to remove all existing passages
-- Run this in Supabase SQL Editor or via psql

-- Delete all passage history records
DELETE FROM passage_history;

-- Delete all passages
DELETE FROM passages;

-- Reset sequences if needed (optional)
-- ALTER SEQUENCE passages_id_seq RESTART WITH 1;
-- ALTER SEQUENCE passage_history_id_seq RESTART WITH 1;

-- Verify cleanup
SELECT COUNT(*) as remaining_passages FROM passages;
SELECT COUNT(*) as remaining_history FROM passage_history;
