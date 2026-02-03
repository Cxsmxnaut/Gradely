import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ditxhuajbvphkjappdbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdHhodWFqYnZwaGtqYXBwZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjE4MzcsImV4cCI6MjA4NTczNzgzN30.AMxsgCqYVcuZg9q2VclaawYfok06ZavwyobXkypm0YU';

// Test with anon key (no authentication)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testPermissions() {
  console.log('🔍 Testing permissions with anonymous user...');
  
  try {
    // Test SELECT
    const { data: selectData, error: selectError } = await supabaseAnon
      .from('grade_cache')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ SELECT error:', selectError);
    } else {
      console.log('✅ SELECT works (but should fail for anon user)');
    }
    
    // Test INSERT
    const { data: insertData, error: insertError } = await supabaseAnon
      .from('grade_cache')
      .insert({
        gradely_user_id: '00000000-0000-0000-0000-000000000000',
        cached_grades: []
      })
      .select();
    
    if (insertError) {
      console.log('❌ INSERT error:', insertError);
    } else {
      console.log('✅ INSERT works (but should fail for anon user)');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testPermissions();
