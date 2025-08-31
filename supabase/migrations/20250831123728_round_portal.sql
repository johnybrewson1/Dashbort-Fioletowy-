/*
  # Create content templates table

  1. New Tables
    - `content_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text, nullable)
      - `template_content` (text)
      - `platform` (text with check constraint)
      - `category` (text)
      - `is_public` (boolean)
      - `usage_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `content_templates` table
    - Add policies for users to manage their own templates
    - Add policy for viewing public templates

  3. Indexes
    - Index on user_id for performance
    - Index on platform for filtering
    - Index on category for filtering
    - Index on is_public for public templates
*/

-- Create content_templates table
CREATE TABLE IF NOT EXISTS content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  template_content text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'X', 'TikTok', 'Blog')),
  category text NOT NULL DEFAULT 'general',
  is_public boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own templates"
  ON content_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates"
  ON content_templates
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can create their own templates"
  ON content_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON content_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON content_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS content_templates_user_id_idx ON content_templates(user_id);
CREATE INDEX IF NOT EXISTS content_templates_platform_idx ON content_templates(platform);
CREATE INDEX IF NOT EXISTS content_templates_category_idx ON content_templates(category);
CREATE INDEX IF NOT EXISTS content_templates_public_idx ON content_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS content_templates_usage_idx ON content_templates(usage_count DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_content_templates_updated_at
  BEFORE UPDATE ON content_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();