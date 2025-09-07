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
  const [expandedField, setExpandedField] = useState<string | null>(null);

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

  const handleIconClick = (field: string) => {
    setExpandedField(expandedField === field ? null : field);
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

          {/* Settings Icons Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Voice for Posts */}
            <div 
              className={`group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                expandedField === 'voice_for_posts' ? 'ring-2 ring-primary bg-primary/10' : ''
              }`}
              onClick={() => handleIconClick('voice_for_posts')}
            >
              <div className="p-6 flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-foreground">Głos do postów</h3>
                  <p className="text-xs text-muted-foreground mt-1">Styl komunikacji</p>
                </div>
              </div>
            </div>

            {/* Voice for Scripts */}
            <div 
              className={`group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                expandedField === 'voice_for_scripts' ? 'ring-2 ring-primary bg-primary/10' : ''
              }`}
              onClick={() => handleIconClick('voice_for_scripts')}
            >
              <div className="p-6 flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-teal-500 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-foreground">Głos do skryptów</h3>
                  <p className="text-xs text-muted-foreground mt-1">Styl dla skryptów</p>
                </div>
              </div>
            </div>

            {/* Style */}
            <div 
              className={`group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                expandedField === 'style' ? 'ring-2 ring-primary bg-primary/10' : ''
              }`}
              onClick={() => handleIconClick('style')}
            >
              <div className="p-6 flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-foreground">Styl</h3>
                  <p className="text-xs text-muted-foreground mt-1">Preferencje twórcze</p>
                </div>
              </div>
            </div>

            {/* Avatar odbiorcy */}
            <div 
              className={`group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                expandedField === 'avatar_recipient' ? 'ring-2 ring-primary bg-primary/10' : ''
              }`}
              onClick={() => handleIconClick('avatar_recipient')}
            >
              <div className="p-6 flex flex-col items-center space-y-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-foreground">Avatar odbiorcy</h3>
                  <p className="text-xs text-muted-foreground mt-1">Grupa docelowa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Field Content */}
          {expandedField && (
            <div className="mt-6 p-6 bg-card/30 border border-form-container-border rounded-lg">
              {expandedField === 'voice_for_posts' && (
                <div className="space-y-2">
                  <Label htmlFor="voiceForPosts" className="text-lg font-semibold flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Głos do postów</span>
                  </Label>
                  <Textarea
                    id="voiceForPosts"
                    placeholder="Opisz swój styl komunikacji dla postów w social media..."
                    value={formData.voice_for_posts}
                    onChange={(e) => handleInputChange('voice_for_posts', e.target.value)}
                    className="input-field text-lg p-6 min-h-32 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {expandedField === 'voice_for_scripts' && (
                <div className="space-y-2">
                  <Label htmlFor="voiceForScripts" className="text-lg font-semibold flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Głos do skryptów</span>
                  </Label>
                  <Textarea
                    id="voiceForScripts"
                    placeholder="Opisz swój styl komunikacji dla skryptów..."
                    value={formData.voice_for_scripts}
                    onChange={(e) => handleInputChange('voice_for_scripts', e.target.value)}
                    className="input-field text-lg p-6 min-h-32 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {expandedField === 'style' && (
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-lg font-semibold flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Styl</span>
                  </Label>
                  <Textarea
                    id="style"
                    placeholder="Opisz swój ogólny styl i preferencje twórcze..."
                    value={formData.style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    className="input-field text-lg p-6 min-h-32 resize-none"
                    rows={6}
                  />
                </div>
              )}

              {expandedField === 'avatar_recipient' && (
                <div className="space-y-2">
                  <Label htmlFor="avatarRecipient" className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Avatar odbiorcy</span>
                  </Label>
                  <Textarea
                    id="avatarRecipient"
                    placeholder="Opisz swoją docelową grupę odbiorców..."
                    value={formData.avatar_recipient}
                    onChange={(e) => handleInputChange('avatar_recipient', e.target.value)}
                    className="input-field text-lg p-6 min-h-32 resize-none"
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}

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