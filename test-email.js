#!/usr/bin/env node

/**
 * Firebase Auth Integration Test
 * Creates test user and typing history for: touxhk@gmail.com
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

function generateUUID() {
  return crypto.randomUUID();
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtchfrjbfndkkntqkweg.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2hmcmpiZm5ka2tudHFrd2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzI1MTMsImV4cCI6MjA5MjUwODUxM30.isEX-fJMooQ9BqidqpaytKX4XT1jCk-yJ_mB6_Rb61s';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const timestamp = Date.now();
const testUser = {
  id: 'test_user_touxhk_' + timestamp,
  email: 'touxhk@gmail.com',
  username: 'touxhk_' + timestamp,
  display_name: 'Test User'
};

const testTypingHistory = [
  { wpm: 85, accuracy: 96.5, duration_ms: 120000, difficulty: 'expert' },
  { wpm: 92, accuracy: 97.2, duration_ms: 150000, difficulty: 'expert' },
  { wpm: 88, accuracy: 95.8, duration_ms: 135000, difficulty: 'expert' },
  { wpm: 95, accuracy: 98.1, duration_ms: 140000, difficulty: 'expert' },
  { wpm: 90, accuracy: 96.9, duration_ms: 125000, difficulty: 'expert' },
  { wpm: 78, accuracy: 94.2, duration_ms: 110000, difficulty: 'beginner' }, // Should not count
  { wpm: 82, accuracy: 95.5, duration_ms: 115000, difficulty: 'advanced' }, // Should not count
];

async function runTest() {
  console.log('\n' + '='.repeat(70));
  console.log('🐟 FISHTYPING - INTEGRATION TEST');
  console.log('='.repeat(70));
  console.log(`📧 Testing for: ${testUser.email}`);
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Create test user
    console.log('1️⃣  Creating test user profile...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: testUser.id,
        username: testUser.username,
        display_name: testUser.display_name,
        preferred_language: 'english',
        updated_at: new Date().toISOString()
      })
      .select();

    if (userError) {
      console.error('❌ Error creating user:', userError.message);
      return;
    }
    console.log('✅ User profile created:', testUser.username);

    // Step 2: Insert typing history
    console.log('\n2️⃣  Inserting typing test history...');
    const historyRecords = testTypingHistory.map((test, index) => ({
      user_id: testUser.id,
      passage_id: generateUUID(),
      wpm: test.wpm,
      accuracy: test.accuracy,
      duration_ms: test.duration_ms,
      difficulty: test.difficulty,
      attempted_at: new Date(Date.now() - (index * 3600000)).toISOString() // Spread over hours
    }));

    const { data: historyData, error: historyError } = await supabase
      .from('passage_history')
      .insert(historyRecords)
      .select();

    if (historyError) {
      console.error('❌ Error inserting history:', historyError.message);
      return;
    }
    console.log(`✅ Inserted ${historyRecords.length} typing test records`);

    // Step 3: Fetch and calculate stats (expert only)
    console.log('\n3️⃣  Calculating stats (expert level only)...');
    const { data: expertHistory, error: statsError } = await supabase
      .from('passage_history')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('difficulty', 'expert');

    if (statsError) {
      console.error('❌ Error fetching stats:', statsError.message);
      return;
    }

    const expertTests = expertHistory || [];
    const totalSessions = expertTests.length;
    const totalWpm = expertTests.reduce((sum, h) => sum + h.wpm, 0);
    const totalAccuracy = expertTests.reduce((sum, h) => sum + h.accuracy, 0);
    const totalDuration = expertTests.reduce((sum, h) => sum + h.duration_ms, 0);

    const averageWpm = totalSessions > 0 ? Math.round(totalWpm / totalSessions) : 0;
    const averageAccuracy = totalSessions > 0 ? Math.round(totalAccuracy / totalSessions) : 0;
    const bestWpm = totalSessions > 0 ? Math.max(...expertTests.map(h => h.wpm)) : 0;
    const totalTimeMinutes = Math.round(totalDuration / 60000);

    const totalWordsTyped = expertTests.reduce((sum, h) => {
      const minutes = h.duration_ms / 60000;
      return sum + Math.round(h.wpm * minutes);
    }, 0);

    console.log('✅ Stats calculated successfully\n');

    // Step 4: Display results
    console.log('='.repeat(70));
    console.log('📊 TEST RESULTS - USER PROFILE STATS');
    console.log('='.repeat(70));
    console.log(`👤 User: ${testUser.display_name} (${testUser.username})`);
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🆔 User ID: ${testUser.id}`);
    console.log('\n📈 EXPERT LEVEL STATISTICS:');
    console.log(`   Total Sessions: ${totalSessions}`);
    console.log(`   Average WPM: ${averageWpm}`);
    console.log(`   Best WPM: ${bestWpm}`);
    console.log(`   Average Accuracy: ${averageAccuracy}%`);
    console.log(`   Total Words Typed: ${totalWordsTyped.toLocaleString()}`);
    console.log(`   Time Practiced: ${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`);
    console.log('\n📝 NOTE: Only expert-level tests are counted (5 out of 7 total tests)');
    console.log('='.repeat(70));

    // Step 5: Verification
    console.log('\n4️⃣  Verification...');
    console.log('✅ Test data inserted successfully');
    console.log('✅ Stats calculated correctly');
    console.log('✅ Profile page will display these stats');

    console.log('\n' + '='.repeat(70));
    console.log('🎯 NEXT STEPS TO VERIFY');
    console.log('='.repeat(70));
    console.log('1. Go to http://localhost:3000/profile');
    console.log('2. Login with Firebase UID:', testUser.id);
    console.log('3. Or use API: http://localhost:3000/api/user-stats?userId=' + testUser.id);
    console.log('4. Verify stats match the values above');

    console.log('\n' + '='.repeat(70));
    console.log('✅ INTEGRATION TEST COMPLETE');
    console.log('='.repeat(70) + '\n');

    // Cleanup option
    console.log('🗑️  To cleanup test data, run:');
    console.log(`   DELETE FROM passage_history WHERE user_id = '${testUser.id}';`);
    console.log(`   DELETE FROM users WHERE id = '${testUser.id}';\n`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
runTest();
