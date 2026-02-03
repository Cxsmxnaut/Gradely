import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ditxhuajbvphkjappdbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdHhodWFqYnZwaGtqYXBwZGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjE4MzcsImV4cCI6MjA4NTczNzgzN30.AMxsgCqYVcuZg9q2VclaawYfok06ZavwyobXkypm0YU';

// Create client with user's access token from logs
const userAccessToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk0OWFmOGVmLWUyNGYtNDFjNi04YTg5LTcxZGNkNGJhYzg5ZSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3J2bGxnbWdjbHRjeW9rbGltc3htLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxM2M3ODcyOC03N2QyLTRmM2QtYmRhNy0xMWQ1ZGFlMjhjYTYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcwMTY1MTU1LCJpYXQiOjE3NzAxNjE1NTUsImVtYWlsIjoiYmhhdml0aC5sb2xha2FwdXJpQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZGF0ZV9vZl9iaXJ0aCI6IjIwMTItMDYtMDIiLCJlbWFpbCI6ImJoYXZpdGgubG9sYWthcHVyaUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfbnVtYmVyIjoiOTI1ODYwODY4NCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMTNjNzg3MjgtNzdkMi00ZjNkLWJkYTctMTFkNWRhZTI4Y2E2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzAwODcyNjh9XSwic2Vzc2lvbl9pZCI6IjZhN2EyYjczLTgzZGItNGUxYS04MzY2LTc1MmVhYTJmN2M4MSIsImlzX2Fub255bW91cyI6ZmFsc2V9.qnKPJKwgZj2jeg3RbSHY2TKjm7DrGwYqfuG52E6XzaQUl7F0DudC0Tb2PsyZGTdbsg1ttE5EA3gIQWAqo69VCw';

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Authorization: `Bearer ${userAccessToken}`
    }
  }
});

async function testAuthenticatedPermissions() {
  console.log('🔍 Testing permissions with authenticated user...');
  
  try {
    // Test SELECT for authenticated user
    const { data: selectData, error: selectError } = await supabaseAuth
      .from('grade_cache')
      .select('*')
      .eq('gradely_user_id', '13c78728-77d2-4f3d-bda7-11d5dae28ca6');
    
    if (selectError) {
      console.log('❌ SELECT error for authenticated user:', selectError);
    } else {
      console.log('✅ SELECT works for authenticated user');
      console.log('📊 Found records:', selectData.length);
    }
    
    // Test INSERT for authenticated user
    const { data: insertData, error: insertError } = await supabaseAuth
      .from('grade_cache')
      .insert({
        gradely_user_id: '13c78728-77d2-4f3d-bda7-11d5dae28ca6',
        cached_grades: [{ test: 'data' }]
      })
      .select();
    
    if (insertError) {
      console.log('❌ INSERT error for authenticated user:', insertError);
    } else {
      console.log('✅ INSERT works for authenticated user');
      console.log('📝 Inserted record:', insertData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAuthenticatedPermissions();
