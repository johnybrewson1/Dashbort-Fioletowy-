import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCreateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateClick }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-background/80 backdrop-blur-sm border-b border-border/20 z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex-1" />
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onCreateClick}
            className="magic-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Stwórz
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};