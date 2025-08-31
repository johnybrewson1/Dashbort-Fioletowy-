/*
  # Create analytics table

  1. New Tables
    - `analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content_type` (text) - posts, scripts, rankings
      - `content_id` (uuid) - reference to content
      - `event_type` (text) - created, updated, deleted, viewed
      - `platform` (text, nullable)
      - `metadata` (jsonb) - flexible data storage
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `analytics` table
    - Add policies for users to view their own analytics

  3. Indexes
    - Index on user_id for performance
    - Index on content_type for filtering
    - Index on event_type for filtering
    - Index on created_at for time-based queries
*/

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('posts', 'scripts', 'rankings', 'templates')),
  content_id uuid,
  event_type text NOT NULL CHECK (event_type IN ('created', 'updated', 'deleted', 'viewed', 'published', 'shared')),
  platform text CHECK (platform IN ('LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'X', 'TikTok', 'Blog')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics(user_id);
CREATE INDEX IF NOT EXISTS analytics_content_type_idx ON analytics(content_type);
CREATE INDEX IF NOT EXISTS analytics_event_type_idx ON analytics(event_type);
CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_platform_idx ON analytics(platform);

-- Create function to log analytics events
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_user_id uuid,
  p_content_type text,
  p_content_id uuid,
  p_event_type text,
  p_platform text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics (user_id, content_type, content_id, event_type, platform, metadata)
  VALUES (p_user_id, p_content_type, p_content_id, p_event_type, p_platform, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;