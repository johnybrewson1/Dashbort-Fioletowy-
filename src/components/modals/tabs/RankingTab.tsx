import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

interface RankingTabProps {
  onClose: () => void;
}

export const RankingTab: React.FC<RankingTabProps> = ({ onClose }) => {
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId } = useSupabaseUser();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        user_id: userId || "{{user_id}}",
        type: 'ranking',
        channelUrl
      };

      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Ranking został utworzony",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć rankingu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title and Subtitle */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Stwórz Ranking
        </h2>
        <p className="text-lg text-muted-foreground">
          Zobacz najlepsze filmy danego kanału YouTube 🔥
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="channelUrl" className="text-xl font-bold text-foreground">
          YouTube Channel URL
        </Label>
        <Input
          id="channelUrl"
          type="url"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="https://youtube.com/@kanał"
          className="input-field text-lg p-4 h-12 border-2 hover:border-primary/50 focus:border-primary transition-all duration-300"
        />
        <p className="text-sm text-muted-foreground">
          Wklej URL kanału YouTube aby utworzyć ranking najlepszych filmów
        </p>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={loading || !channelUrl}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-4 text-lg h-auto"
      >
        <span className="mr-2">🔥</span>
        {loading ? 'Analizuję kanał...' : 'Stwórz Ranking'}
      </Button>
    </div>
  );
};