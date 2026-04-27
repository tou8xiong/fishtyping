-- Fix: Update intermediate passages to advanced
-- Run this in your Supabase SQL Editor

UPDATE passages
SET difficulty = 'advanced'
WHERE difficulty = 'intermediate';

-- Verify the fix
SELECT difficulty, language, COUNT(*) as count, AVG(word_count) as avg_words
FROM passages
GROUP BY difficulty, language
ORDER BY difficulty, language;
