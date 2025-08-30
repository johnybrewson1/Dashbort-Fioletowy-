import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Save } from 'lucide-react';
import { airtableService, User } from '@/services/airtable';
import { toast } from '@/hooks/use-toast';

export const SettingsSection: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const users = await airtableService.getUsers();
      if (users.length > 0) {
        setUser(users[0]); // Get first user for now
      } else {
        // Initialize default user
        setUser({
          id: '',
          username: 'Darek Szoen',
          voiceForPosts: '',
          style: '',
          voiceForScripts: '',
          avatarRecipient: ''
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (user.id) {
        // Update existing user
        const success = await airtableService.updateUser(user.id, user);
        if (success) {
          toast({
            title: "Sukces",
            description: "Ustawienia zostały zapisane",
          });
        } else {
          throw new Error('Failed to update user');
        }
      } else {
        // Create new user
        const newUserId = await airtableService.createUser(user);
        if (newUserId) {
          setUser(prev => prev ? { ...prev, id: newUserId } : null);
          toast({
            title: "Sukces",
            description: "Ustawienia zostały utworzone i zapisane",
          });
        } else {
          throw new Error('Failed to create user');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (user) {
      setUser(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  if (!user) {
    return <div className="text-center py-8">Ładowanie ustawień...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Ustawienia
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
                  {user.username.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Label className="text-sm font-medium">Avatar</Label>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="username" className="text-lg font-semibold">Nazwa użytkownika</Label>
              <Input
                id="username"
                value={user.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="input-field text-lg p-4 h-12"
              />
            </div>
          </div>

          {/* Voice for Posts */}
          <div className="space-y-2">
            <Label htmlFor="voiceForPosts" className="text-lg font-semibold">Głos do postów</Label>
            <Textarea
              id="voiceForPosts"
              placeholder="Opisz swój styl komunikacji dla postów w social media..."
              value={user.voiceForPosts}
              onChange={(e) => handleInputChange('voiceForPosts', e.target.value)}
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
              value={user.voiceForScripts}
              onChange={(e) => handleInputChange('voiceForScripts', e.target.value)}
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
              value={user.style}
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
              value={user.avatarRecipient}
              onChange={(e) => handleInputChange('avatarRecipient', e.target.value)}
              className="input-field text-lg p-6 min-h-32 resize-none"
              rows={6}
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};