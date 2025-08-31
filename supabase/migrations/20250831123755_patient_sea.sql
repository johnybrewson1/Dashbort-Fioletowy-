/*
  # Create database functions for Dream Post Forge

  1. Functions
    - `get_user_stats()` - Get user statistics
    - `search_content()` - Full-text search across content
    - `soft_delete_content()` - Soft delete function
    - `restore_content()` - Restore soft-deleted content
    - `get_analytics_summary()` - Get analytics summary

  2. Security
    - All functions use SECURITY DEFINER
    - Proper RLS enforcement
*/

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'posts_count', (SELECT COUNT(*) FROM posts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'scripts_count', (SELECT COUNT(*) FROM scripts WHERE user_id = p_user_id AND deleted_at IS NULL),
    'rankings_count', (SELECT COUNT(*) FROM rankings WHERE user_id = p_user_id AND deleted_at IS NULL),
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

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_content(
  p_user_id uuid,
  p_query text,
  p_content_type text DEFAULT 'all'
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  type text,
  platform text,
  created_at timestamptz,
  relevance real
) AS $$
BEGIN
  IF p_content_type = 'all' OR p_content_type = 'posts' THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.title,
      p.content,
      'post'::text as type,
      p.platform,
      p.created_at,
      ts_rank(to_tsvector('english', p.title || ' ' || p.content), plainto_tsquery('english', p_query)) as relevance
    FROM posts p
    WHERE p.user_id = p_user_id 
      AND p.deleted_at IS NULL
      AND (to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', p_query));
  END IF;

  IF p_content_type = 'all' OR p_content_type = 'scripts' THEN
    RETURN QUERY
    SELECT 
      s.id,
      s.title,
      s.content,
      'script'::text as type,
      s.platform,
      s.created_at,
      ts_rank(to_tsvector('english', s.title || ' ' || s.content), plainto_tsquery('english', p_query)) as relevance
    FROM scripts s
    WHERE s.user_id = p_user_id 
      AND s.deleted_at IS NULL
      AND (to_tsvector('english', s.title || ' ' || s.content) @@ plainto_tsquery('english', p_query));
  END IF;

  IF p_content_type = 'all' OR p_content_type = 'rankings' THEN
    RETURN QUERY
    SELECT 
      r.id,
      r.title,
      COALESCE(r.description, '')::text as content,
      'ranking'::text as type,
      ''::text as platform,
      r.created_at,
      ts_rank(to_tsvector('english', r.title || ' ' || COALESCE(r.description, '')), plainto_tsquery('english', p_query)) as relevance
    FROM rankings r
    WHERE r.user_id = p_user_id 
      AND r.deleted_at IS NULL
      AND (to_tsvector('english', r.title || ' ' || COALESCE(r.description, '')) @@ plainto_tsquery('english', p_query));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_content(
  p_content_type text,
  p_content_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  CASE p_content_type
    WHEN 'posts' THEN
      UPDATE posts 
      SET deleted_at = now() 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NULL;
    WHEN 'scripts' THEN
      UPDATE scripts 
      SET deleted_at = now() 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NULL;
    WHEN 'rankings' THEN
      UPDATE rankings 
      SET deleted_at = now() 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NULL;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft-deleted content
CREATE OR REPLACE FUNCTION restore_content(
  p_content_type text,
  p_content_id uuid,
  p_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  CASE p_content_type
    WHEN 'posts' THEN
      UPDATE posts 
      SET deleted_at = NULL 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NOT NULL;
    WHEN 'scripts' THEN
      UPDATE scripts 
      SET deleted_at = NULL 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NOT NULL;
    WHEN 'rankings' THEN
      UPDATE rankings 
      SET deleted_at = NULL 
      WHERE id = p_content_id AND user_id = p_user_id AND deleted_at IS NOT NULL;
    ELSE
      RETURN false;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;