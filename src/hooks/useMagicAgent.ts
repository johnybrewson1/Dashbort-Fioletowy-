import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { buildApiUrl } from '@/lib/config';

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
  const { userId } = useSupabaseUser();
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
  const [useThumbnail, setUseThumbnail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContentTypeChange = (platform: keyof ContentTypes, types: string[]) => {
    setSelectedContentTypes(prev => ({
      ...prev,
      [platform]: types
    }));
  };

  const handlePlatformChange = (platforms: PlatformSelection) => {
    setSelectedPlatforms(platforms);
    
    // Reset thumbnail option when YouTube is deselected
    if (!platforms.youtube) {
      setUseThumbnail(false);
    }
  };

  const buildWebhookPayload = () => {
    console.log('Building webhook payload, userId:', userId);
    const payload = {
      user_id: userId || "{{user_id}}",
      źródło: 'magic agent',
      content,
      imageUrl,
      blogPurpose,
      Post: {
        instagram: selectedPlatforms.instagram,
        linkedin: selectedPlatforms.linkedin,
        x: selectedPlatforms.x,
        facebook: selectedPlatforms.facebook,
        blog: selectedPlatforms.blog || false
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
      voiceForPosts: settings.voiceForPosts,
      voiceForScripts: settings.voiceForScripts, 
      style: settings.style,
      avatarRecipient: settings.avatarRecipient,
      brandDescription: settings.brandDescription,
      language: settings.language
    };


    return payload;
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
      
      const response = await fetch(buildApiUrl('/api/generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          content: content,
          selectedPlatforms: selectedPlatforms,
          selectedContentTypes: selectedContentTypes,
          user_id: userId
        }),
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
    useThumbnail,
    setUseThumbnail,
    loading,
    handleContentTypeChange,
    handlePlatformChange,
    handleSubmit
  };
};