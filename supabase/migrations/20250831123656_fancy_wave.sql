/*
  # Create scripts table

  1. New Tables
    - `scripts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text)
      - `script_type` (text with check constraint)
      - `platform` (text with check constraint)
      - `status` (text with check constraint)
      - `image_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable for soft delete)

  2. Security
    - Enable RLS on `scripts` table
    - Add policies for authenticated users to manage their own scripts

  3. Indexes
    - Index on user_id for performance
    - Index on script_type for filtering
    - Index on platform for filtering
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  script_type text NOT NULL CHECK (script_type IN ('Haczyki', 'Krótki Skrypt', 'Średni skrypt', 'Instagram Captions', 'YouTube Captions', 'TikTok Captions', 'Szkic')),
  platform text CHECK (platform IN ('LinkedIn', 'Instagram', 'Facebook', 'YouTube', 'X', 'TikTok', 'Blog')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scripts"
  ON scripts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts"
  ON scripts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS scripts_user_id_idx ON scripts(user_id);
CREATE INDEX IF NOT EXISTS scripts_type_idx ON scripts(script_type);
CREATE INDEX IF NOT EXISTS scripts_platform_idx ON scripts(platform);
CREATE INDEX IF NOT EXISTS scripts_status_idx ON scripts(status);
CREATE INDEX IF NOT EXISTS scripts_created_at_idx ON scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS scripts_deleted_at_idx ON scripts(deleted_at) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();