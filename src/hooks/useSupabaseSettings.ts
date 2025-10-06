import { useState, useEffect } from 'react';
import { profilesService } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useSupabaseSettings = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profilesService.getCurrent();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Profile might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    try {
      setSaving(true);
      console.log('updateProfile - Sending updates:', updates);
      const updatedProfile = await profilesService.update(updates);
      console.log('updateProfile - Received updated profile:', updatedProfile);
      setProfile(updatedProfile);
      
      toast({
        title: "Sukces",
        description: "Ustawienia zostały zapisane",
      });
      
      return true;
    } catch (error) {
      console.error('updateProfile - Error updating profile:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    saving,
    loadProfile,
    updateProfile
  };
};