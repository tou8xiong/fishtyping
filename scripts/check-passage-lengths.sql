-- Check what length values exist in your passages table
SELECT DISTINCT length, difficulty, language, COUNT(*) as count
FROM passages
GROUP BY length, difficulty, language
ORDER BY difficulty, language, length;
