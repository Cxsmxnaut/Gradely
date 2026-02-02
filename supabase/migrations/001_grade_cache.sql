-- Grade Cache Table for Gradely-native accounts
-- Stores cached grades per user account for immediate display

CREATE TABLE IF NOT EXISTS grade_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gradely_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linked_account_id TEXT, -- Optional: ID of linked StudentVUE account
  cached_grades JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of cached Course objects
  last_sync_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one cache record per user
  CONSTRAINT unique_user_cache UNIQUE(gradely_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_grade_cache_user_id ON grade_cache(gradely_user_id);
CREATE INDEX IF NOT EXISTS idx_grade_cache_last_sync ON grade_cache(last_sync_timestamp);
CREATE INDEX IF NOT EXISTS idx_grade_cache_linked_account ON grade_cache(linked_account_id) WHERE linked_account_id IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_grade_cache_updated_at
  BEFORE UPDATE ON grade_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE grade_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own grade cache
CREATE POLICY "Users can view own grade cache" ON grade_cache
  FOR SELECT USING (auth.uid() = gradely_user_id);

-- Policy: Users can only insert their own grade cache
CREATE POLICY "Users can insert own grade cache" ON grade_cache
  FOR INSERT WITH CHECK (auth.uid() = gradely_user_id);

-- Policy: Users can only update their own grade cache
CREATE POLICY "Users can update own grade cache" ON grade_cache
  FOR UPDATE USING (auth.uid() = gradely_user_id);

-- Policy: Users can only delete their own grade cache
CREATE POLICY "Users can delete own grade cache" ON grade_cache
  FOR DELETE USING (auth.uid() = gradely_user_id);
