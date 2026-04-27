-- Debug: Check current status of passages
SELECT status, difficulty, language, COUNT(*) as count
FROM passages
GROUP BY status, difficulty, language
ORDER BY status, difficulty, language;

-- Also check a few sample passages
SELECT id, difficulty, language, status, LEFT(content, 50) as content_preview
FROM passages
LIMIT 10;
