import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Mic, FileText, Palette, Users } from 'lucide-react';
import { useSupabaseSettings } from '@/hooks/useSupabaseSettings';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseSettingsSection: React.FC = () => {
  const { profile, loading, saving, updateProfile } = useSupabaseSettings();
  const [formData, setFormData] = useState({
    name: '',
    voice_for_posts: '',
    voice_for_scripts: '',
    style: '',
    avatar_recipient: '',
    subscription_plan: 'free'
  });
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadUserEmail();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        voice_for_posts: profile.voice_for_posts || '',
        voice_for_scripts: profile.voice_for_scripts || '',
        style: profile.style || '',
        avatar_recipient: profile.avatar_recipient || '',
        subscription_plan: profile.subscription_plan || 'free'
      });
    }
  }, [profile]);

  const loadUserEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
      }
    } catch (error) {
      console.error('Error loading user email:', error);
    }
  };

  const handleSave = async () => {
    const success = await updateProfile(formData);
    if (success) {
      // Optionally reload or update local state
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="form-container border-form-container-border backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Ustawienia (Supabase)
        </h1>
        <p className="text-muted-foreground">Skonfiguruj swoje preferencje i styl komunikacji</p>
      </div>

      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 shadow-platform">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span>Profil użytkownika</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username and Avatar */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-lg">
                  {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label className="text-sm font-medium">Avatar</Label>
            </div>
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-semibold">Nazwa użytkownika</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field text-lg p-4 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-semibold">Email</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="input-field text-lg p-4 h-12 opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-2">
            <Label htmlFor="subscription" className="text-lg font-semibold">Plan subskrypcji</Label>
            <Select value={formData.subscription_plan} onValueChange={(value) => handleInputChange('subscription_plan', value)}>
              <SelectTrigger className="input-field text-lg p-4 h-12">
                <SelectValue placeholder="Wybierz plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Voice for Posts */}
          <div className="space-y-2">
            <Label htmlFor="voiceForPosts" className="text-lg font-semibold">Głos do postów</Label>
            <Textarea
              id="voiceForPosts"
              placeholder="Opisz swój styl komunikacji dla postów w social media..."
              value={formData.voice_for_posts}
              onChange={(e) => handleInputChange('voice_for_posts', e.target.value)}
              className="input-field text-lg p-6 min-h-32 resize-none"
              rows={6}
            />
          </div>

          {/* Voice for Scripts */}
          <div className="space-y-2">
            <Label htmlFor="voiceForScripts" className="text-lg font-semibold">Głos do skryptów</Label>
            <Textarea
              id="voiceForScripts"
              placeholder="Opisz swój styl komunikacji dla skryptów..."
              value={formData.voice_for_scripts}
              onChange={(e) => handleInputChange('voice_for_scripts', e.target.value)}
              className="input-field text-lg p-6 min-h-32 resize-none"
              rows={6}
            />
          </div>

          {/* Style */}
          <div className="space-y-2">
            <Label htmlFor="style" className="text-lg font-semibold">Styl</Label>
            <Textarea
              id="style"
              placeholder="Opisz swój ogólny styl i preferencje twórcze..."
              value={formData.style}
              onChange={(e) => handleInputChange('style', e.target.value)}
              className="input-field text-lg p-6 min-h-32 resize-none"
              rows={6}
            />
          </div>

          {/* Avatar odbiorcy */}
          <div className="space-y-2">
            <Label htmlFor="avatarRecipient" className="text-lg font-semibold">Avatar odbiorcy</Label>
            <Textarea
              id="avatarRecipient"
              placeholder="Opisz swoją docelową grupę odbiorców..."
              value={formData.avatar_recipient}
              onChange={(e) => handleInputChange('avatar_recipient', e.target.value)}
              className="input-field text-lg p-6 min-h-32 resize-none"
              rows={6}
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};