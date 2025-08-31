import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { YouTubeTab } from './tabs/YouTubeTab';
import { RankingTab } from './tabs/RankingTab';
import { MagicAgentTab } from './tabs/MagicAgentTab';
import { useSettings } from '@/hooks/useSettings';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('youtube');
  const { settings } = useSettings();
  
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
    youtube: [] as string[],
    linkedin: [] as string[],
    x: [] as string[],
    blog: [] as string[],
  });
  const [useThumbnail, setUseThumbnail] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // State for YouTubeTab
  const [youtubeUrl, setYoutubeUrl] = useState('');

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
    if (!data.youtubeUrl.trim()) {
      console.error('YouTube URL is required');
      return;
    }

    const hasSelectedPlatform = Object.values(selectedPlatforms).some(Boolean);
    if (!hasSelectedPlatform) {
      console.error('At least one platform must be selected');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          źródło: 'youtube',
          youtubeUrl: data.youtubeUrl,
          guidelines: data.guidelines,
          platforms: selectedPlatforms,
          contentTypes: selectedContentTypes,
          useThumbnail,
          thumbnailUrl: useThumbnail ? generateYouTubeThumbnailUrl(data.youtubeUrl) : undefined,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
        }),
      });

      if (response.ok) {
        console.log('YouTube content submitted successfully');
        onClose();
      } else {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      console.error('Error submitting YouTube content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="form-container border-form-container-border max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-sm">
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