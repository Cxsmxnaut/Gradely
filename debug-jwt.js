import { createClient } from '@supabase/supabase-js';

// The token from logs shows issuer: https://rvllgmglctcyoklimsxm.supabase.co/auth/v1
// But .env shows: https://ditxhuajbvphkjappdbb.supabase.co

console.log('🔍 Checking JWT token issuer...');
const userAccessToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ijk0OWFmOGVmLWUyNGYtNDFjNi04YTg5LTcxZGNkNGJhYzg5ZSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3J2bGxnbWdjbHRjeW9rbGltc3htLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIxM2M3ODcyOC03N2QyLTRmM2QtYmRhNy0xMWQ1ZGFlMjhjYTYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcwMTY1MTU1LCJpYXQiOjE3NzAxNjE1NTUsImVtYWlsIjoiYmhhdml0aC5sb2xha2FwdXJpQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZGF0ZV9vZl9iaXJ0aCI6IjIwMTItMDYtMDIiLCJlbWFpbCI6ImJoYXZpdGgubG9sYWthcHVyaUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfbnVtYmVyIjoiOTI1ODYwODY4NCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMTNjNzg3MjgtNzdkMi00ZjNkLWJkYTctMTFkNWRhZTI4Y2E2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzAwODcyNjh9XSwic2Vzc2lvbl9pZCI6IjZhN2EyYjczLTgzZGItNGUxYS04MzY2LTc1MmVhYTJmN2M4MSIsImlzX2Fub255bW91cyI6ZmFsc2V9.qnKPJKwgZj2jeg3RbSHY2TKjm7DrGwYqfuG52E6XzaQUl7F0DudC0Tb2PsyZGTdbsg1ttE5EA3gIQWAqo69VCw';

// Decode the JWT payload (without verification)
const parts = userAccessToken.split('.');
if (parts.length === 3) {
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('📋 JWT Payload:');
  console.log('- Issuer:', payload.iss);
  console.log('- Subject (user ID):', payload.sub);
  console.log('- Expires at:', new Date(payload.exp * 1000));
  console.log('- Email:', payload.email);
}

console.log('\n🔗 URLs:');
console.log('- JWT Issuer:', 'https://rvllgmglctcyoklimsxm.supabase.co');
console.log('- .env URL:', 'https://ditxhuajbvphkjappdbb.supabase.co');
console.log('\n❌ MISMATCH: The JWT token is from a different Supabase project!');

console.log('\n🔧 Fix: Update .env file to use the correct Supabase project:');
console.log('VITE_SUPABASE_URL=https://rvllgmglctcyoklimsxm.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=NEEDS_TO_BE_FOUND_FOR_THIS_PROJECT');
