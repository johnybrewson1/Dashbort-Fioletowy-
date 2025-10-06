-- Fix get_user_stats function to work without captions table initially
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  posts_count integer;
  scripts_count integer;
  rankings_count integer;
  captions_count integer := 0;
BEGIN
  -- Count posts
  SELECT COUNT(*) INTO posts_count 
  FROM posts 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Count scripts
  SELECT COUNT(*) INTO scripts_count 
  FROM scripts 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Count rankings
  SELECT COUNT(*) INTO rankings_count 
  FROM rankings 
  WHERE user_id = p_user_id AND deleted_at IS NULL;
  
  -- Count captions (if table exists)
  BEGIN
    SELECT COUNT(*) INTO captions_count 
    FROM captions 
    WHERE user_id = p_user_id AND deleted_at IS NULL;
  EXCEPTION
    WHEN undefined_table THEN
      captions_count := 0;
  END;
  
  -- Build result
  SELECT jsonb_build_object(
    'posts_count', posts_count,
    'scripts_count', scripts_count,
    'rankings_count', rankings_count,
    'captions_count', captions_count,
    'templates_count', 0,
    'total_content', posts_count + scripts_count + rankings_count + captions_count,
    'last_activity', (
      SELECT MAX(created_at) FROM (
        SELECT created_at FROM posts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM scripts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM rankings WHERE user_id = p_user_id
        UNION ALL
        SELECT COALESCE(created_at, '1970-01-01'::timestamptz) FROM captions WHERE user_id = p_user_id
      ) AS activities
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

