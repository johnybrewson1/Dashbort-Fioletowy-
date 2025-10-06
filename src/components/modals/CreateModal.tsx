import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

import { YouTubeTab } from './tabs/YouTubeTab';
import { RankingTab } from './tabs/RankingTab';
import { MagicAgentTab } from './tabs/MagicAgentTab';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('youtube');
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();
  
  console.log('CreateModal - userId:', userId);
  
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: false,
    tiktok: false,
    youtube: false,
    linkedin: false,
    x: false,
    facebook: false,
    blog: false,
  });
  const [selectedContentTypes, setSelectedContentTypes] = useState({
    instagram: [] as string[],
    tiktok: [] as string[],
    youtube: [] as string[],
    linkedin: [] as string[],
    x: [] as string[],
  });
  const [useThumbnail, setUseThumbnail] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for YouTubeTab
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Function to validate YouTube URL
  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
    return youtubeRegex.test(url.trim());
  };

  // Function to generate YouTube thumbnail URL
  const generateYouTubeThumbnailUrl = (youtubeUrl: string): string => {
    try {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      return '';
    } catch (error) {
      console.error('Error generating YouTube thumbnail URL:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować URL miniaturki YouTube",
        variant: "destructive",
      });
      return '';
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: checked
    }));
  };

  const handleContentTypeChange = (platform: string, types: string[]) => {
    setSelectedContentTypes(prev => ({
      ...prev,
      [platform]: types
    }));
  };


  const handleYouTubeSubmit = async (data: { youtubeUrl: string; guidelines: string }) => {
    // Walidacja
    if (!data.youtubeUrl.trim()) {
      toast({
        title: "Błąd walidacji",
        description: "URL YouTube jest wymagany",
        variant: "destructive",
      });
      return;
    }

    if (!validateYouTubeUrl(data.youtubeUrl)) {
      toast({
        title: "Błąd walidacji",
        description: "Nieprawidłowy format URL YouTube",
        variant: "destructive",
      });
      return;
    }

    const hasSelectedPlatform = Object.values(selectedPlatforms).some(Boolean);
    if (!hasSelectedPlatform) {
      toast({
        title: "Błąd walidacji",
        description: "Wybierz przynajmniej jedną platformę",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Pokaż toast ładowania
    toast({
      title: "Przetwarzanie",
      description: "YouTube Transcriber uruchamia się...",
    });

    try {
      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          źródło: 'youtube',
          youtubeUrl: data.youtubeUrl,
          guidelines: data.guidelines,
          Post: {
            instagram: selectedPlatforms.instagram,
            linkedin: selectedPlatforms.linkedin,
            x: selectedPlatforms.x,
            facebook: selectedPlatforms.facebook
          },
          Filmy: {
            "Haczyki": selectedContentTypes.youtube.includes("Haczyki"),
            "Thumbnail": useThumbnail,
            "Krótki skrypt": selectedContentTypes.youtube.includes("Krótki skrypt"),
            "Średni skrypt": selectedContentTypes.youtube.includes("Średni skrypt")
          },
          Captions: {
            "TikTok": selectedContentTypes.tiktok.includes("TikTok"),
            "YouTube": selectedContentTypes.tiktok.includes("YouTube"),
            "Instagram": selectedContentTypes.tiktok.includes("Instagram")
          },
          thumbnailUrl: useThumbnail ? generateYouTubeThumbnailUrl(data.youtubeUrl) : undefined,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        }),
      });

      if (response.ok) {
        console.log('YouTube content submitted successfully');
        
        toast({
          title: "Sukces!",
          description: "YouTube Transcriber został uruchomiony pomyślnie",
        });
        
        onClose();
      } else {
        // Obsługa błędów HTTP
        const errorText = await response.text().catch(() => 'Nieznany błąd');
        console.error('HTTP Error:', response.status, errorText);
        
        let errorMessage = 'Nie udało się wysłać żądania';
        if (response.status === 400) {
          errorMessage = 'Nieprawidłowe dane wejściowe';
        } else if (response.status === 401) {
          errorMessage = 'Błąd autoryzacji';
        } else if (response.status === 403) {
          errorMessage = 'Brak uprawnień';
        } else if (response.status === 404) {
          errorMessage = 'Serwis niedostępny';
        } else if (response.status >= 500) {
          errorMessage = 'Błąd serwera Make.com';
        }
        
        toast({
          title: "Błąd YouTube Transcriber",
          description: `${errorMessage} (${response.status})`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting YouTube content:', error);
      
      let errorMessage = 'Nie udało się przetworzyć YouTube';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Błąd połączenia z serwerem';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Błąd połączenia",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="form-container border-form-container-border max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Stwórz Nową Treść
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/10 p-1">
            <TabsTrigger value="youtube" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              YouTube
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ranking
            </TabsTrigger>
            <TabsTrigger value="magic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Magic Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="youtube" className="mt-6">
            <YouTubeTab 
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              selectedPlatforms={selectedPlatforms}
              onPlatformChange={handlePlatformChange}
              selectedContentTypes={selectedContentTypes}
              onContentTypeChange={handleContentTypeChange}
              useThumbnail={useThumbnail}
              onUseThumbnailChange={setUseThumbnail}
              loading={loading}
              onSubmit={handleYouTubeSubmit}
            />
          </TabsContent>

          <TabsContent value="ranking" className="mt-6">
            <RankingTab onClose={onClose} />
          </TabsContent>

          <TabsContent value="magic" className="mt-6">
            <MagicAgentTab onClose={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};