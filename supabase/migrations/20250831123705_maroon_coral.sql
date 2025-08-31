/*
  # Create rankings table

  1. New Tables
    - `rankings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text, nullable)
      - `category` (text with check constraint)
      - `ratio` (numeric)
      - `video_url` (text)
      - `thumbnail_url` (text, nullable)
      - `should_create_content` (boolean)
      - `status` (text with check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `deleted_at` (timestamp, nullable for soft delete)

  2. Security
    - Enable RLS on `rankings` table
    - Add policies for authenticated users to manage their own rankings

  3. Indexes
    - Index on user_id for performance
    - Index on category for filtering
    - Index on ratio for sorting
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create rankings table
CREATE TABLE IF NOT EXISTS rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('Technology', 'Business', 'Marketing', 'Health', 'Education', 'Entertainment', 'Sports', 'Science', 'Other')),
  ratio numeric NOT NULL DEFAULT 0,
  video_url text NOT NULL,
  thumbnail_url text,
  should_create_content boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rankings"
  ON rankings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own rankings"
  ON rankings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings"
  ON rankings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings"
  ON rankings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS rankings_user_id_idx ON rankings(user_id);
CREATE INDEX IF NOT EXISTS rankings_category_idx ON rankings(category);
CREATE INDEX IF NOT EXISTS rankings_ratio_idx ON rankings(ratio DESC);
CREATE INDEX IF NOT EXISTS rankings_status_idx ON rankings(status);
CREATE INDEX IF NOT EXISTS rankings_created_at_idx ON rankings(created_at DESC);
CREATE INDEX IF NOT EXISTS rankings_deleted_at_idx ON rankings(deleted_at) WHERE deleted_at IS NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();