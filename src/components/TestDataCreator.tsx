import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const TestDataCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const createTestData = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Błąd",
          description: "Użytkownik nie jest zalogowany",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating test data for user:', user.id);

      // Create test posts
      const testPosts = [
        {
          user_id: user.id,
          title: "Test Post 1",
          content: "To jest testowy post 1",
          platform: "Instagram",
          status: "draft",
          image_url: "https://picsum.photos/400/300?random=1"
        },
        {
          user_id: user.id,
          title: "Test Post 2", 
          content: "To jest testowy post 2",
          platform: "LinkedIn",
          status: "draft",
          image_url: "https://picsum.photos/400/300?random=2"
        }
      ];

      // Create test scripts
      const testScripts = [
        {
          user_id: user.id,
          title: "Test Script 1",
          content: "To jest testowy skrypt 1",
          script_type: "Haczyki",
          platform: "Instagram",
          status: "draft",
          image_url: "https://picsum.photos/400/300?random=3"
        },
        {
          user_id: user.id,
          title: "Test Script 2",
          content: "To jest testowy skrypt 2", 
          script_type: "Instagram Captions",
          platform: "Instagram",
          status: "draft",
          image_url: "https://picsum.photos/400/300?random=4"
        }
      ];

      // Create test rankings
      const testRankings = [
        {
          user_id: user.id,
          title: "Test Ranking 1",
          description: "To jest testowy ranking 1",
          category: "Technology",
          ratio: 85.5,
          video_url: "https://www.youtube.com/watch?v=test1",
          thumbnail_url: "https://picsum.photos/400/300?random=5",
          should_create_content: true,
          status: "active"
        },
        {
          user_id: user.id,
          title: "Test Ranking 2",
          description: "To jest testowy ranking 2",
          category: "Business", 
          ratio: 92.3,
          video_url: "https://www.youtube.com/watch?v=test2",
          thumbnail_url: "https://picsum.photos/400/300?random=6",
          should_create_content: false,
          status: "active"
        }
      ];

      // Insert posts
      const { error: postsError } = await supabase
        .from('posts')
        .insert(testPosts);

      if (postsError) {
        console.error('Error creating posts:', postsError);
        throw postsError;
      }

      // Insert scripts
      const { error: scriptsError } = await supabase
        .from('scripts')
        .insert(testScripts);

      if (scriptsError) {
        console.error('Error creating scripts:', scriptsError);
        throw scriptsError;
      }

      // Insert rankings
      const { error: rankingsError } = await supabase
        .from('rankings')
        .insert(testRankings);

      if (rankingsError) {
        console.error('Error creating rankings:', rankingsError);
        throw rankingsError;
      }

      toast({
        title: "Sukces! 🎉",
        description: "Utworzono dane testowe dla Twojego konta",
      });

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć danych testowych",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="form-container border-form-container-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Test Data Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Utwórz przykładowe dane (posty, skrypty, rankingi) przypisane do Twojego konta.
        </p>
        <Button 
          onClick={createTestData}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Tworzenie danych..." : "Utwórz dane testowe"}
        </Button>
      </CardContent>
    </Card>
  );
};
