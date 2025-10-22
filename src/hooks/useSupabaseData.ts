import { useState, useEffect } from 'react';
import { postsService, scriptsService, rankingsService, captionsService, analyticsService } from '@/lib/supabase';
import type { Post, Script, Ranking, Caption } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

export const useSupabasePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Debug: Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      // Try backend API first, fallback to Supabase
      try {
        const response = await fetch('https://ricky-endotrophic-therese.ngrok-free.dev/api/content/posts', {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded posts from backend API:', data);
          console.log('Data type:', typeof data);
          console.log('Is array:', Array.isArray(data));
          
          // Handle different response formats
          let postsArray = [];
          if (Array.isArray(data)) {
            postsArray = data;
          } else if (data && Array.isArray(data.posts)) {
            postsArray = data.posts;
          } else if (data && Array.isArray(data.data)) {
            postsArray = data.data;
          } else if (data && typeof data === 'object') {
            // Convert object to array if it's a single post
            postsArray = [data];
          }
          
          console.log('Processed posts array:', postsArray);
          setPosts(postsArray);
          setError(null);
          return;
        }
      } catch (apiError) {
        console.log('Backend API error:', apiError);
        console.log('Backend API not available, falling back to Supabase');
      }
      
      // Fallback to Supabase
      const data = await postsService.getAll();
      console.log('Loaded posts from Supabase:', data);
      setPosts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newPost = await postsService.create({
        ...post,
        user_id: user.id
      });
      
      setPosts(prev => [newPost, ...prev]);
      await analyticsService.logEvent('posts', newPost.id, 'created', post.platform);
      return newPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      const updatedPost = await postsService.update(id, updates);
      setPosts(prev => prev.map(p => p.id === id ? updatedPost : p));
      await analyticsService.logEvent('posts', id, 'updated', updates.platform);
      return updatedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      // Try backend API first, fallback to Supabase
      try {
        const response = await fetch(`https://ricky-endotrophic-therese.ngrok-free.dev/api/content/posts/${id}`, {
          method: 'DELETE',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });

        if (response.ok) {
          console.log('Post deleted from backend API:', id);
          setPosts(prev => prev.filter(p => p.id !== id));
          await analyticsService.logEvent('posts', id, 'deleted');
          return;
        }
      } catch (apiError) {
        console.log('Backend API delete error:', apiError);
        console.log('Backend API not available, falling back to Supabase');
      }

      // Fallback to Supabase
      await postsService.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      await analyticsService.logEvent('posts', id, 'deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    loadPosts,
    createPost,
    updatePost,
    deletePost
  };
};

export const useSupabaseScripts = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScripts = async () => {
    try {
      setLoading(true);
      
      // Debug: Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user for scripts:', user);
      
      const data = await scriptsService.getAll();
      console.log('Loaded scripts:', data);
      setScripts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading scripts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  const createScript = async (script: Omit<Script, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newScript = await scriptsService.create({
        ...script,
        user_id: user.id
      });
      
      setScripts(prev => [newScript, ...prev]);
      await analyticsService.logEvent('scripts', newScript.id, 'created', script.platform);
      return newScript;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
      throw err;
    }
  };

  const updateScript = async (id: string, updates: Partial<Script>) => {
    try {
      const updatedScript = await scriptsService.update(id, updates);
      setScripts(prev => prev.map(s => s.id === id ? updatedScript : s));
      await analyticsService.logEvent('scripts', id, 'updated', updates.platform);
      return updatedScript;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update script');
      throw err;
    }
  };

  const deleteScript = async (id: string) => {
    try {
      // Try backend API first, fallback to Supabase
      try {
        const response = await fetch(`https://ricky-endotrophic-therese.ngrok-free.dev/api/content/scripts/${id}`, {
          method: 'DELETE',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });

        if (response.ok) {
          console.log('Script deleted from backend API:', id);
          setScripts(prev => prev.filter(s => s.id !== id));
          await analyticsService.logEvent('scripts', id, 'deleted');
          return;
        }
      } catch (apiError) {
        console.log('Backend API delete error:', apiError);
        console.log('Backend API not available, falling back to Supabase');
      }

      // Fallback to Supabase
      await scriptsService.delete(id);
      setScripts(prev => prev.filter(s => s.id !== id));
      await analyticsService.logEvent('scripts', id, 'deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete script');
      throw err;
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

  return {
    scripts,
    loading,
    error,
    loadScripts,
    createScript,
    updateScript,
    deleteScript
  };
};

export const useSupabaseRankings = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRankings = async () => {
    try {
      setLoading(true);
      
      // Debug: Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user for rankings:', user);
      
      const data = await rankingsService.getAll();
      console.log('Loaded rankings:', data);
      setRankings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading rankings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const createRanking = async (ranking: Omit<Ranking, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newRanking = await rankingsService.create({
        ...ranking,
        user_id: user.id
      });
      
      setRankings(prev => [newRanking, ...prev]);
      await analyticsService.logEvent('rankings', newRanking.id, 'created');
      return newRanking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ranking');
      throw err;
    }
  };

  const updateRanking = async (id: string, updates: Partial<Ranking>) => {
    try {
      const updatedRanking = await rankingsService.update(id, updates);
      setRankings(prev => prev.map(r => r.id === id ? updatedRanking : r));
      await analyticsService.logEvent('rankings', id, 'updated');
      return updatedRanking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ranking');
      throw err;
    }
  };

  const deleteRanking = async (id: string) => {
    try {
      await rankingsService.delete(id);
      setRankings(prev => prev.filter(r => r.id !== id));
      await analyticsService.logEvent('rankings', id, 'deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ranking');
      throw err;
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  return {
    rankings,
    loading,
    error,
    loadRankings,
    createRanking,
    updateRanking,
    deleteRanking
  };
};

export const useSupabaseStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('Loading stats...');
      const data = await analyticsService.getUserStats();
      console.log('Stats loaded:', data);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    loadStats
  };
};

export const useSupabaseCaptions = () => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCaptions = async () => {
    try {
      setLoading(true);
      
      // Debug: Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('loadCaptions - Current user for captions:', user);
      console.log('loadCaptions - User ID:', user?.id);
      
      if (!user) {
        console.log('loadCaptions - No user found, setting empty captions');
        setCaptions([]);
        setError('Użytkownik nie jest zalogowany');
        return;
      }

      const data = await captionsService.getAll();
      console.log('loadCaptions - Loaded captions:', data);
      console.log('loadCaptions - Number of captions:', data?.length || 0);
      setCaptions(data || []);
      setError(null);
    } catch (err) {
      console.error('loadCaptions - Error loading captions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load captions');
    } finally {
      setLoading(false);
    }
  };

  const createCaption = async (caption: Omit<Caption, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newCaption = await captionsService.create({
        ...caption,
        user_id: user.id
      });
      
      setCaptions(prev => [newCaption, ...prev]);
      await analyticsService.logEvent('captions', newCaption.id, 'created', caption.platform);
      return newCaption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create caption');
      throw err;
    }
  };

  const updateCaption = async (id: string, updates: Partial<Caption>) => {
    try {
      const updatedCaption = await captionsService.update(id, updates);
      setCaptions(prev => prev.map(c => c.id === id ? updatedCaption : c));
      await analyticsService.logEvent('captions', id, 'updated', updates.platform);
      return updatedCaption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update caption');
      throw err;
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      // Try backend API first, fallback to Supabase
      try {
        const response = await fetch(`https://ricky-endotrophic-therese.ngrok-free.dev/api/content/captions/${id}`, {
          method: 'DELETE',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });

        if (response.ok) {
          console.log('Caption deleted from backend API:', id);
          setCaptions(prev => prev.filter(c => c.id !== id));
          await analyticsService.logEvent('captions', id, 'deleted');
          return;
        }
      } catch (apiError) {
        console.log('Backend API delete error:', apiError);
        console.log('Backend API not available, falling back to Supabase');
      }

      // Fallback to Supabase
      await captionsService.delete(id);
      setCaptions(prev => prev.filter(c => c.id !== id));
      await analyticsService.logEvent('captions', id, 'deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete caption');
      throw err;
    }
  };

  useEffect(() => {
    loadCaptions();
  }, []);

  return {
    captions,
    loading,
    error,
    loadCaptions,
    createCaption,
    updateCaption,
    deleteCaption
  };
};