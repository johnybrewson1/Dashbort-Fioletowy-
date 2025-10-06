-- Migrate existing captions from scripts table to captions table
-- First, ensure captions table exists
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

-- Migrate captions from scripts table
INSERT INTO public.captions (user_id, title, content, platform, status, image_url, created_at, updated_at, deleted_at)
SELECT 
  user_id,
  title,
  content,
  platform,
  status,
  image_url,
  created_at,
  updated_at,
  deleted_at
FROM public.scripts 
WHERE script_type LIKE '%Captions%' 
  AND script_type LIKE '%Caption%'
  AND NOT EXISTS (
    SELECT 1 FROM public.captions c 
    WHERE c.user_id = scripts.user_id 
      AND c.title = scripts.title 
      AND c.content = scripts.content
  );

-- Update get_user_stats function to properly count captions
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  posts_count integer := 0;
  scripts_count integer := 0;
  rankings_count integer := 0;
  captions_count integer := 0;
BEGIN
  -- Count posts
  SELECT COUNT(*) INTO posts_count 
  FROM posts 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Count scripts (excluding captions)
  SELECT COUNT(*) INTO scripts_count 
  FROM scripts 
  WHERE user_id = p_user_id 
    AND deleted_at IS NULL
    AND script_type NOT LIKE '%Captions%'
    AND script_type NOT LIKE '%Caption%';
  
  -- Count rankings
  SELECT COUNT(*) INTO rankings_count 
  FROM rankings 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Count captions
  SELECT COUNT(*) INTO captions_count 
  FROM captions 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Build result
  SELECT jsonb_build_object(
    'posts_count', posts_count,
    'scripts_count', scripts_count,
    'rankings_count', rankings_count,
    'captions_count', captions_count,
    'templates_count', 0,
    'total_content', posts_count + scripts_count + rankings_count + captions_count,
    'last_activity', COALESCE((
      SELECT MAX(created_at) FROM (
        SELECT created_at FROM posts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM scripts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM rankings WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM captions WHERE user_id = p_user_id
      ) AS activities
    ), '1970-01-01'::timestamptz)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

