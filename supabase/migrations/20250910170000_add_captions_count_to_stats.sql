-- Add captions_count to get_user_stats function
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'posts_count', (SELECT COUNT(*) FROM posts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'scripts_count', (SELECT COUNT(*) FROM scripts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'rankings_count', (SELECT COUNT(*) FROM rankings WHERE user_id = p_user_id AND deleted_at IS NULL),
    'captions_count', (
      SELECT COUNT(*) FROM scripts 
      WHERE user_id = p_user_id 
        AND deleted_at IS NULL 
        AND (script_type LIKE '%Captions%' OR script_type LIKE '%Caption%')
    ),
    'templates_count', (SELECT COUNT(*) FROM content_templates WHERE user_id = p_user_id),
    'total_content', (
      SELECT COUNT(*) FROM (
        SELECT id FROM posts WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM scripts WHERE user_id = p_user_id AND deleted_at IS NULL
        UNION ALL
        SELECT id FROM rankings WHERE user_id = p_user_id AND deleted_at IS NULL
      ) AS total
    ),
    'last_activity', (
      SELECT MAX(created_at) FROM (
        SELECT created_at FROM posts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM scripts WHERE user_id = p_user_id
        UNION ALL
        SELECT created_at FROM rankings WHERE user_id = p_user_id
      ) AS activities
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

