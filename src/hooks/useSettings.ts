import { useState, useEffect } from 'react';
import { airtableService, User } from '@/services/airtable';

interface UserSettings {
  voiceForPosts: string;
  voiceForScripts: string; 
  style: string;
  avatarRecipient: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    voiceForPosts: 'default',
    voiceForScripts: 'default',
    style: 'default',
    avatarRecipient: 'default'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const users = await airtableService.getUsers();
      if (users.length > 0) {
        const user = users[0];
        setSettings({
          voiceForPosts: user.voiceForPosts || 'default',
          voiceForScripts: user.voiceForScripts || 'default',
          style: user.style || 'default',
          avatarRecipient: user.avatarRecipient || 'default'
        });
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