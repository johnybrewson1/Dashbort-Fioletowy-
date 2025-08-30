import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';

interface PlatformSelection {
  instagram: boolean;
  tiktok: boolean;
  youtube: boolean;
  linkedin: boolean;
  x: boolean;
  facebook: boolean;
  blog: boolean;
}

interface ContentTypes {
  instagram: string[];
  tiktok: string[];
  youtube: string[];
  linkedin: string[];
  x: string[];
  facebook: string[];
  blog: string[];
}

export const useMagicAgent = () => {
  const [content, setContent] = useState('');
  const { settings } = useSettings();
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformSelection>({
    instagram: false,
    tiktok: false,
    youtube: false,
    linkedin: false,
    x: false,
    facebook: false,
    blog: false,
  });
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentTypes>({
    instagram: [],
    tiktok: [],
    youtube: [],
    linkedin: [],
    x: [],
    facebook: [],
    blog: []
  });
  const [imageUrl, setImageUrl] = useState('');
  const [blogPurpose, setBlogPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContentTypeChange = (platform: keyof ContentTypes, types: string[]) => {
    setSelectedContentTypes(prev => ({
      ...prev,
      [platform]: types
    }));
  };

  const handlePlatformChange = (platforms: PlatformSelection) => {
    setSelectedPlatforms(platforms);
  };

  const buildWebhookPayload = () => {
    return {
      źródło: 'magic agent',
      content,
      imageUrl,
      blogPurpose,
      platforms: selectedPlatforms,
      contentTypes: selectedContentTypes,
      voiceForPosts: settings.voiceForPosts,
      voiceForScripts: settings.voiceForScripts, 
      style: settings.style,
      avatarRecipient: settings.avatarRecipient
    };
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!content.trim()) {
      toast({
        title: "Błąd",
        description: "Pole treści jest wymagane",
        variant: "destructive",
      });
      return false;
    }

    const hasSelectedPlatform = Object.values(selectedPlatforms).some(Boolean);
    if (!hasSelectedPlatform) {
      toast({
        title: "Błąd", 
        description: "Wybierz przynajmniej jedną platformę",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    
    try {
      const payload = buildWebhookPayload();
      
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Sukces! 🎉",
          description: "Twój post został wygenerowany!",
        });
        
        // Reset form
        setContent('');
        setSelectedPlatforms({
          instagram: false,
          tiktok: false,
          youtube: false,
          linkedin: false,
          x: false,
          facebook: false,
          blog: false,
        });
        setSelectedContentTypes({
          instagram: [],
          tiktok: [],
          youtube: [],
          linkedin: [],
          x: [],
          facebook: [],
          blog: [],
        });
        setImageUrl('');
        setBlogPurpose('');
        return true;
      } else {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      console.error('Error sending webhook:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas generowania postu. Spróbuj ponownie.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    content,
    setContent,
    selectedPlatforms,
    selectedContentTypes,
    imageUrl,
    setImageUrl,
    blogPurpose,
    setBlogPurpose,
    loading,
    handleContentTypeChange,
    handlePlatformChange,
    handleSubmit
  };
};