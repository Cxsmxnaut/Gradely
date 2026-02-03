import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://ditxhuajbvphkjappdbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdHhodWFqYnZwaGtqYXBwZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjE4MzcsImV4cCI6MjA4NTczNzgzN30.AMxsgCqYVcuZg9q2VclaawYfok06ZavwyobXkypm0YU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyMigration() {
  try {
    console.log('🔍 Checking if grade_cache table exists...');
    
    // Try to select from the table to see if it exists
    const { data, error } = await supabase
      .from('grade_cache')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ grade_cache table does not exist. Please apply the migration manually in Supabase dashboard.');
      console.log('\n📋 Migration SQL to run in Supabase dashboard:');
      console.log('=====================================');
      
      const migrationSQL = readFileSync('./supabase/migrations/001_grade_cache.sql', 'utf8');
      console.log(migrationSQL);
      console.log('=====================================');
      
      console.log('\n🔗 Go to your Supabase dashboard > SQL Editor and run the above SQL.');
    } else if (error) {
      console.log('❌ Error accessing grade_cache table:', error);
    } else {
      console.log('✅ grade_cache table exists and is accessible');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

applyMigration();
