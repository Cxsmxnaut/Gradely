# Supabase Setup Guide for Grade Caching

## 🚨 Important: Supabase Not Configured

The grade caching system is currently using localStorage as a fallback because Supabase environment variables are not configured. For true cross-device persistence, you need to set up Supabase.

## 🔧 Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up/login and create a new project
4. Choose a database password and region
5. Wait for the project to be created

### 2. Get Your Supabase Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
3. Copy the **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Set Environment Variables
Create a `.env` file in the project root with:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Replace with your actual credentials from step 2.

### 4. Run the Database Migration

**🚨 CRITICAL STEP - This fixes the 404 error!**

The error `"Could not find the table 'public.grade_cache'"` means you need to create the database table.

**Option A: Use Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy the entire contents of `SUPABASE_SQL_SCRIPT.sql` file
5. Paste it into the SQL editor
6. Click **"Run"** or press **Ctrl+Enter**
7. You should see: `"Grade cache table created successfully!"`

**Option B: Use the SQL from this file directly**
```sql
-- Create the grade_cache table
CREATE TABLE IF NOT EXISTS grade_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gradely_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_account_id TEXT,
  cached_grades JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_cache UNIQUE(gradely_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grade_cache_user_id ON grade_cache(gradely_user_id);
CREATE INDEX IF NOT EXISTS idx_grade_cache_last_sync ON grade_cache(last_sync_timestamp);

-- Enable RLS
ALTER TABLE grade_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own grade cache" ON grade_cache
  FOR SELECT USING (auth.uid() = gradely_user_id);

CREATE POLICY "Users can insert own grade cache" ON grade_cache
  FOR INSERT WITH CHECK (auth.uid() = gradely_user_id);

CREATE POLICY "Users can update own grade cache" ON grade_cache
  FOR UPDATE USING (auth.uid() = gradely_user_id);

CREATE POLICY "Users can delete own grade cache" ON grade_cache
  FOR DELETE USING (auth.uid() = gradely_user_id);
```

### 5. Verify Setup
After setup, you should see:
- ✅ No more "⚠️ Supabase not configured" warnings in console
- ✅ Grades persist across different browsers/devices
- ✅ True server-side caching functionality

## 🧪 Testing Cross-Device Persistence

1. **Login on Browser A**: Load some grades
2. **Login on Browser B**: Same account should show cached grades immediately
3. **Check Console**: Should show "Using cached grades from server" instead of fallback messages

## 🔄 Current Behavior (Fallback Mode)

While Supabase is not configured:
- Grades are cached in localStorage per browser
- Cross-device persistence won't work
- Console shows "⚠️ Supabase not configured, using localStorage fallback"
- All other caching features work (immediate loading, background sync, etc.)

## 📱 Deployment Notes

When deploying to Vercel, make sure to add the Supabase environment variables to your Vercel project settings:

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Redeploy the application

## 🆘 Troubleshooting

**Issue**: Still seeing fallback warnings
- Check that environment variables are set correctly
- Verify Supabase project URL and keys
- Make sure the database migration was run successfully

**Issue**: Grades not persisting across devices
- Ensure you're logging in with the same Gradely account
- Check that the `grade_cache` table exists in Supabase
- Verify the RLS policies are working correctly

**Issue**: Database errors
- Run the migration SQL manually in Supabase dashboard
- Check that all tables and indexes were created
- Verify the user authentication is working
