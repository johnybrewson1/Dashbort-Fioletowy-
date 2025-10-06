import { useState, useEffect } from 'react';
import { airtableService, User } from '@/services/airtable';
import { profilesService } from '@/lib/supabase';

export interface UserSettings {
  voiceForPosts: string;
  voiceForScripts: string; 
  style: string;
  avatarRecipient: string;
  brandDescription: string;
  language: string;
  seoKeywords: string;
}

export const useSettings = (): { settings: UserSettings; loading: boolean; refetch: () => Promise<void> } => {
  const [settings, setSettings] = useState<UserSettings>({
    voiceForPosts: 'default',
    voiceForScripts: 'default',
    style: 'default',
    avatarRecipient: 'default',
    brandDescription: 'default',
    language: 'PL',
    seoKeywords: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from Supabase first
      try {
        const profile = await profilesService.getCurrent();
        setSettings({
          voiceForPosts: profile.tone_of_voice || 'default',
          voiceForScripts: profile.tone_of_voice || 'default',
          style: profile.tone_of_voice || 'default',
          avatarRecipient: profile.target_audience || 'default',
          brandDescription: profile.brand_description || 'default',
          language: profile.language || 'PL',
          seoKeywords: profile.seo_keywords || ''
        });
      } catch (supabaseError) {
        console.log('Supabase not available, falling back to Airtable');
        // Fallback to Airtable
        const users = await airtableService.getUsers();
        if (users.length > 0) {
          const user = users[0];
          setSettings({
            voiceForPosts: user.voiceForPosts || 'default',
            voiceForScripts: user.voiceForScripts || 'default',
            style: user.style || 'default',
            avatarRecipient: user.avatarRecipient || 'default',
            brandDescription: 'default',
            language: 'PL',
            seoKeywords: ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    refetch: loadSettings
  };
};