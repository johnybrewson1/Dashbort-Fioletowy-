import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Home, FileText, Video, TrendingUp, Settings } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [profile, setProfile] = useState({
    name: 'Darek Szoen',
    email: 'dariuszszoen@gmail.com',
    avatar: ''
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'posts', label: 'Posty', icon: FileText },
    { id: 'scripts', label: 'Skrypty', icon: Video },
    { id: 'rankings', label: 'Ranking', icon: TrendingUp },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile(prev => ({
          ...prev,
          email: user.email || prev.email
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-background/95 to-card/95 backdrop-blur-sm border-r border-border/50 z-20">
      <div className="p-6 space-y-6">
        {/* Brand Header */}
        <div className="text-center border-b border-border/20 pb-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ContentHub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Premium Dashboard</p>
        </div>

        {/* User Profile */}
        <div className="flex flex-col items-center space-y-3 bg-card/30 rounded-xl p-4 border border-border/20">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-white font-bold">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-card flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-foreground text-sm">{profile.name}</h3>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg' 
                    : 'hover:bg-card/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </aside>
  );
};