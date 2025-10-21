-- Social Media Posts Table (supports TikTok, Instagram, etc.)
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  title TEXT,
  source TEXT NOT NULL, -- 'TikTok', 'Instagram', etc.
  type TEXT NOT NULL, -- 'tiktok', 'instagram', etc.
  thumbnail_url TEXT,
  post_id TEXT, -- video_id for TikTok, post_id for Instagram
  author TEXT,
  author_id TEXT,
  location TEXT,
  captions TEXT,
  description TEXT,
  play_count BIGINT DEFAULT 0,
  digg_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  share_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0, -- For Instagram
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for user access (if you want user-specific posts)
-- Uncomment the following lines if you want users to only see their own posts:
-- CREATE POLICY "Users can access their own saved posts" ON social_posts
--   FOR ALL USING (auth.uid() = user_id);

-- Create policy for public access (all users can see all posts)
CREATE POLICY "Public access to all posts" ON social_posts
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_social_posts_created_at ON social_posts(created_at DESC);
CREATE INDEX idx_social_posts_post_id ON social_posts(post_id);
CREATE INDEX idx_social_posts_author ON social_posts(author);
CREATE INDEX idx_social_posts_source ON social_posts(source);
CREATE INDEX idx_social_posts_type ON social_posts(type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_social_posts_updated_at 
    BEFORE UPDATE ON social_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
