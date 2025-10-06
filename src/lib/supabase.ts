import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for our tables
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

export type Script = Database['public']['Tables']['scripts']['Row'];
export type ScriptInsert = Database['public']['Tables']['scripts']['Insert'];
export type ScriptUpdate = Database['public']['Tables']['scripts']['Update'];

export type Ranking = Database['public']['Tables']['rankings']['Row'];
export type RankingInsert = Database['public']['Tables']['rankings']['Insert'];
export type RankingUpdate = Database['public']['Tables']['rankings']['Update'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Caption = Database['public']['Tables']['captions']['Row'];
export type CaptionInsert = Database['public']['Tables']['captions']['Insert'];
export type CaptionUpdate = Database['public']['Tables']['captions']['Update'];

// Posts service
export const postsService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(post: PostInsert) {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: PostUpdate) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  async restore(id: string) {
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: null })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Scripts service
export const scriptsService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(script: ScriptInsert) {
    const { data, error } = await supabase
      .from('scripts')
      .insert(script)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: ScriptUpdate) {
    const { data, error } = await supabase
      .from('scripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('scripts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Rankings service
export const rankingsService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('ratio', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(ranking: RankingInsert) {
    const { data, error } = await supabase
      .from('rankings')
      .insert(ranking)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: RankingUpdate) {
    const { data, error } = await supabase
      .from('rankings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rankings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Profiles service
export const profilesService = {
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(updates: ProfileUpdate | any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('profilesService.update - User:', user.id);
    console.log('profilesService.update - Updates:', updates);

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    console.log('profilesService.update - Response data:', data);
    console.log('profilesService.update - Response error:', error);
    
    if (error) throw error;
    return data;
  }
};

// Captions service
export const captionsService = {
  async getAll() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(caption: CaptionInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('captions')
      .insert({
        ...caption,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: CaptionUpdate) {
    const { data, error } = await supabase
      .from('captions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('captions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Analytics service
export const analyticsService = {
  async getUserStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .rpc('get_user_stats', { p_user_id: user.id });
    
    if (error) throw error;
    return data;
  },

  async logEvent(
    contentType: string,
    contentId: string,
    eventType: string,
    platform?: string,
    metadata?: any
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // TODO: Implement analytics function in database
    console.log('Analytics event:', { contentType, contentId, eventType, platform, metadata });
  }
};

// Search service
export const searchService = {
  async searchContent(query: string, contentType: string = 'all') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .rpc('search_content', {
        p_user_id: user.id,
        p_query: query,
        p_content_type: contentType
      });
    
    if (error) throw error;
    return data;
  }
};