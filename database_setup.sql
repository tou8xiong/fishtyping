-- ============================================
-- Firebase Auth Migration - Complete Database Setup
-- ============================================

-- STEP 1: Drop foreign key constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE passage_history DROP CONSTRAINT IF EXISTS passage_history_user_id_fkey;
ALTER TABLE passage_history DROP CONSTRAINT IF EXISTS passage_history_passage_id_fkey;

-- STEP 2: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- STEP 3: Change users table id from UUID to TEXT for Firebase UIDs
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- STEP 4: Update foreign key in passage_history table
ALTER TABLE passage_history ALTER COLUMN user_id TYPE TEXT;

-- STEP 5: Add new columns to passage_history for tracking difficulty
ALTER TABLE passage_history ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE passage_history ADD COLUMN IF NOT EXISTS challenge_type TEXT;
ALTER TABLE passage_history ADD COLUMN IF NOT EXISTS theme TEXT;

-- STEP 6: Recreate foreign key constraint with TEXT type
ALTER TABLE passage_history
  ADD CONSTRAINT passage_history_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- STEP 7: Recreate RLS policies (allow all since Firebase handles auth)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true);

-- STEP 8: Add RLS policies for passage_history
DROP POLICY IF EXISTS "Users can view passage history" ON passage_history;
DROP POLICY IF EXISTS "Users can insert passage history" ON passage_history;

CREATE POLICY "Users can view passage history" ON passage_history
  FOR SELECT USING (true);

CREATE POLICY "Users can insert passage history" ON passage_history
  FOR INSERT WITH CHECK (true);

-- ============================================
-- NOTES:
-- - RLS policies set to 'true' because Firebase handles authentication
-- - Application code will handle permissions
-- - Only expert-level stats are counted for leaderboard/profile
-- ============================================
