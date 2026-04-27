const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtchfrjbfndkkntqkweg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2hmcmpiZm5ka2tudHFrd2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzI1MTMsImV4cCI6MjA5MjUwODUxM30.isEX-fJMooQ9BqidqpaytKX4XT1jCk-yJ_mB6_Rb61s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeaderboard() {
  console.log('Checking passage_history with expert difficulty...\n');
  
  const { data: history } = await supabase
    .from('passage_history')
    .select('user_id, wpm, difficulty')
    .eq('difficulty', 'expert')
    .order('wpm', { ascending: false })
    .limit(10);
  
  console.log('Expert-level history entries:');
  console.log(history);
  
  console.log('\n\nChecking users table...\n');
  const userIds = [...new Set(history?.map(h => h.user_id) || [])];
  
  const { data: users } = await supabase
    .from('users')
    .select('id, username, display_name')
    .in('id', userIds);
  
  console.log('Users in users table:');
  console.log(users);
  
  console.log('\n\nUser IDs in history but NOT in users table:');
  const userIdsInTable = new Set(users?.map(u => u.id) || []);
  const orphanedIds = userIds.filter(id => !userIdsInTable.has(id));
  console.log(orphanedIds);
}

checkLeaderboard();
