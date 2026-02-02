-- Create table for StudentVUE credentials
CREATE TABLE IF NOT EXISTS studentvue_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  district_url TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL, -- This will be encrypted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE studentvue_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own credentials
CREATE POLICY "Users can manage their own StudentVUE credentials" ON studentvue_credentials
  FOR ALL USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_studentvue_credentials_user_id ON studentvue_credentials(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_studentvue_credentials_updated_at
  BEFORE UPDATE ON studentvue_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
