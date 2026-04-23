# Word Count by Difficulty - Implementation Summary

## Changes Made

### 1. Updated Word Count Mapping

**Old System (by Length):**
- Short: 50-80 words
- Medium: 100-150 words
- Long: 200-300 words

**New System (by Difficulty):**
- Beginner: 15-30 words - "Short, builds confidence, simple words"
- Intermediate: 40-80 words - "Enough to build rhythm and flow"
- Advanced: 100-150 words - "Tests sustained focus and stamina"
- Expert: 200-300 words - "For serious practice only"

### 2. Files Modified

#### `src/lib/supabase/types.ts`
- Added `WORD_COUNT_BY_DIFFICULTY` constant with word count ranges
- Kept `Length` type for backward compatibility with database

#### `src/app/api/generate-passage/route.ts`
- Updated `buildPrompt()` to use difficulty-based word counts
- Now generates passages with exact word count ranges per difficulty

#### `src/app/api/worker/generate-pool/route.ts`
- Updated `buildPrompt()` to use difficulty-based word counts
- Background worker now generates passages with correct word counts

#### `src/features/typing-test/components/TypingTest.tsx`
- Removed `length` state variable
- Removed Length selector from UI
- Updated difficulty dropdown to show word counts:
  - "Beginner (15-30 words)"
  - "Intermediate (40-80 words)"
  - "Advanced (100-150 words)"
  - "Expert (200-300 words)"
- Still sends `length: 'medium'` to API for backward compatibility

#### `src/features/typing-test/utils/passageGenerator.ts`
- Exported `WORD_COUNT_BY_DIFFICULTY` constant

### 3. Database Schema

**No database changes required!**

The `passages` table still has the `length` column, which is kept for backward compatibility. The system now primarily uses `difficulty` to determine word count, but still stores `length` in the database.

### 4. How It Works Now

1. User selects difficulty level (Beginner, Intermediate, Advanced, Expert)
2. System determines word count range based on difficulty
3. AI generates passage with exact word count for that difficulty
4. Passage is saved to database with both `difficulty` and `length` fields
5. User types the passage appropriate for their skill level

### 5. Benefits

✅ **Clearer progression** - Word count directly tied to skill level
✅ **Better UX** - Users see word count in dropdown
✅ **Simpler UI** - One less selector (removed Length)
✅ **More accurate** - AI generates exact word counts per difficulty
✅ **Backward compatible** - Database schema unchanged

### 6. Testing

To test the new system:

```bash
# Generate new passages with updated word counts
node scripts/generate-passages.js

# Visit the app
npm run dev

# Try different difficulty levels:
# - Beginner should give 15-30 word passages
# - Intermediate should give 40-80 word passages
# - Advanced should give 100-150 word passages
# - Expert should give 200-300 word passages
```

### 7. Migration Notes

**Existing passages in database:**
- Will still work fine
- May have old word counts (50-80, 100-150, 200-300)
- New passages will use new word counts (15-30, 40-80, 100-150, 200-300)
- Over time, old passages will be replaced by new ones

**No action required:**
- System is backward compatible
- Old passages will gradually be replaced
- No database migration needed

### 8. Word Count Validation

The AI is instructed to generate:
```
- Beginner: EXACTLY between 15 and 30 words
- Intermediate: EXACTLY between 40 and 80 words
- Advanced: EXACTLY between 100 and 150 words
- Expert: EXACTLY between 200 and 300 words
```

The `word_count` field in the database tracks actual word count for analytics.

## Summary

The system now uses difficulty-based word counts instead of separate length settings. This provides a clearer progression path for users and simplifies the UI while maintaining full backward compatibility with existing data.

**Date:** 2026-04-23
**Status:** ✅ Complete and Ready for Testing
