const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtchfrjbfndkkntqkweg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2hmcmpiZm5ka2tudHFrd2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzI1MTMsImV4cCI6MjA5MjUwODUxM30.isEX-fJMooQ9BqidqpaytKX4XT1jCk-yJ_mB6_Rb61s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPassageStatus() {
  // Update all in_use Lao passages to ready
  const { data, error } = await supabase
    .from('passages')
    .update({ status: 'ready' })
    .eq('language', 'lao')
    .eq('status', 'in_use')
    .select();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Updated ${data.length} Lao passages to ready status`);
}

fixPassageStatus();
