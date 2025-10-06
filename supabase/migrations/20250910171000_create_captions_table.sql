-- Create captions table
CREATE TABLE IF NOT EXISTS public.captions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'draft',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.captions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own captions" ON public.captions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own captions" ON public.captions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own captions" ON public.captions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own captions" ON public.captions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS captions_user_id_idx ON public.captions(user_id);
CREATE INDEX IF NOT EXISTS captions_created_at_idx ON public.captions(created_at);
CREATE INDEX IF NOT EXISTS captions_deleted_at_idx ON public.captions(deleted_at);

-- Update get_user_stats function to use captions table
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'posts_count', (SELECT COUNT(*) FROM posts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'scripts_count', (SELECT COUNT(*) FROM scripts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'rankings_count', (SELECT COUNT(*) FROM rankings WHERE user_id = p_user_id AND deleted_at IS NULL),
    'captions_count', (SELECT COUNT(*) FROM captions WHERE user_id = p_user_id AND deleted_at IS NULL),
    'templates_count', (SELECT COUNT(*) FROM content_templates WHERE user_id = p_user_id),
    'total_content', (
      SELECT COUNT(*) FROM (
        SELECT id FROM posts WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM scripts WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM rankings WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM captions WHERE user_id = p_user_id AND deleted_at IS NULL
      ) AS total
    ),
    'last_activity', (
      SELECT MAX(created_at) FROM (
        SELECT created_at FROM posts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM scripts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM rankings WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM captions WHERE user_id = p_user_id
      ) AS activities
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

