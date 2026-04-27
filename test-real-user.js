#!/usr/bin/env node

/**
 * Insert typing history for real Firebase user
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

// Your real Firebase user ID
const userId = '8OZdxsSF8gY5ysBogP5yqkTMaZI3';

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
  console.log('🐟 FISHTYPING - INSERT TYPING HISTORY');
  console.log('='.repeat(70));
  console.log(`👤 User ID: ${userId}`);
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log('='.repeat(70) + '\n');

  try {
    // Insert typing history
    console.log('1️⃣  Inserting typing test history...');
    const historyRecords = testTypingHistory.map((test, index) => ({
      user_id: userId,
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

    // Fetch and calculate stats (expert only)
    console.log('\n2️⃣  Calculating stats (expert level only)...');
    const { data: expertHistory, error: statsError } = await supabase
      .from('passage_history')
      .select('*')
      .eq('user_id', userId)
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

    // Display results
    console.log('='.repeat(70));
    console.log('📊 YOUR PROFILE STATS');
    console.log('='.repeat(70));
    console.log(`👤 User ID: ${userId}`);
    console.log('\n📈 EXPERT LEVEL STATISTICS:');
    console.log(`   Total Sessions: ${totalSessions}`);
    console.log(`   Average WPM: ${averageWpm}`);
    console.log(`   Best WPM: ${bestWpm}`);
    console.log(`   Average Accuracy: ${averageAccuracy}%`);
    console.log(`   Total Words Typed: ${totalWordsTyped.toLocaleString()}`);
    console.log(`   Time Practiced: ${Math.floor(totalTimeMinutes / 60)}h ${totalTimeMinutes % 60}m`);
    console.log('\n📝 NOTE: Only expert-level tests are counted (5 out of 7 total tests)');
    console.log('='.repeat(70));

    console.log('\n' + '='.repeat(70));
    console.log('🎯 NEXT STEPS');
    console.log('='.repeat(70));
    console.log('1. Refresh your profile page: http://localhost:3000/profile');
    console.log('2. You should now see the stats above');
    console.log('3. API endpoint: http://localhost:3000/api/user-stats?userId=' + userId);

    console.log('\n' + '='.repeat(70));
    console.log('✅ COMPLETE');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    console.error(error);
  }
}

// Run the test
runTest();
