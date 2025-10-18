import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { LoadingModal } from '@/components/ui/LoadingModal';
import { supabase } from '@/integrations/supabase/client';
import { JobStatus } from '@/integrations/supabase/types';

import { YouTubeTab } from './tabs/YouTubeTab';
import { RankingTab } from './tabs/RankingTab';
import { MagicAgentTab } from './tabs/MagicAgentTab';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { buildApiUrl } from '@/lib/config';

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
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [loadingDescription, setLoadingDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Job tracking states
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | 'submitting'>('submitting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for YouTubeTab
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Realtime subscription for job status tracking

  // Function to reset job state
  const resetJobState = () => {
    setJobId(null);
    setJobStatus('submitting');
    setErrorMessage('');
  };

  // Supabase Realtime subscription for job tracking
  useEffect(() => {
    if (!jobId || jobStatus === 'completed' || jobStatus === 'failed' || jobStatus === 'timed_out') {
      return;
    }

    console.log('🔍 Setting up Realtime subscription for job:', jobId);

    // Fallback timeout - 5 minutes max
    const timeoutId = setTimeout(() => {
      console.log('⏰ Job timeout after 5 minutes');
      setJobStatus('timed_out');
      setErrorMessage('Przetwarzanie trwało zbyt długo. Spróbuj ponownie.');
      setLoadingModalOpen(false);
      toast({
        title: "⏰ Timeout",
        description: "Przetwarzanie trwało zbyt długo. Spróbuj ponownie.",
        variant: "destructive",
        duration: 10000,
      });
    }, 300000); // 5 minutes

    // Subscribe to job status changes
    const channel = supabase
      .channel(`job-status-${jobId}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'jobs', 
          filter: `id=eq.${jobId}` 
        },
        (payload) => {
          console.log('📡 Received job update:', payload);
          const newStatus = payload.new.status as JobStatus;
          
          if (newStatus === 'completed') {
            console.log('✅ Job completed successfully');
            setJobStatus('completed');
            setLoadingModalOpen(false);
            toast({
              title: "🎉 Sukces!",
              description: "Treści zostały pomyślnie utworzone! Sprawdź swoje posty.",
              duration: 8000,
            });
            clearTimeout(timeoutId);
            setTimeout(() => {
              onClose();
              resetJobState();
            }, 2000);
          } else if (newStatus === 'failed') {
            console.log('❌ Job failed:', payload.new.error_message);
            setJobStatus('failed');
            setErrorMessage(payload.new.error_message || 'Wystąpił błąd podczas przetwarzania.');
            setLoadingModalOpen(false);
            toast({
              title: "❌ Błąd",
              description: payload.new.error_message || 'Wystąpił błąd podczas przetwarzania.',
              variant: "destructive",
              duration: 15000,
            });
            clearTimeout(timeoutId);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up Realtime subscription');
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [jobId, jobStatus, onClose]);

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

  const getDetailedErrorMessage = (error: any, operation: string): string => {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return `Błąd połączenia z serwerem podczas ${operation}. Sprawdź połączenie internetowe.`;
    } else if (error instanceof Error) {
      return `${operation}: ${error.message}`;
    } else if (typeof error === 'string') {
      return `${operation}: ${error}`;
    } else {
      return `Wystąpił nieoczekiwany błąd podczas ${operation}. Spróbuj ponownie.`;
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

    console.log('🚀 Starting YouTube Transcriber...', { data, loadingModalOpen, loadingTitle, userId });
    
    // Sprawdź czy userId istnieje
    if (!userId) {
      toast({
        title: "Błąd autoryzacji",
        description: "Nie jesteś zalogowany. Zaloguj się ponownie.",
        variant: "destructive",
      });
      return;
    }
    
    // Reset job state
    resetJobState();
    setJobStatus('submitting');
    setLoading(true);
    setLoadingModalOpen(true);
    setLoadingTitle('Wysyłanie do Make.com...');
    setLoadingDescription('Przekazywanie danych do Make.com. To może potrwać do 30 sekund.');
    console.log('✅ Loading modal should be open now', { loadingModalOpen: true, loadingTitle: 'Wysyłanie do Make.com...', userId });
    
    // Pokaż toast ładowania
    toast({
      title: "Wysyłanie do Make.com",
      description: "Przekazywanie danych do Make.com...",
    });

    // Dodaj timeout dla requestu
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sekund timeout
    
    try {
      
      const response = await fetch(buildApiUrl('/api/jobs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        signal: controller.signal,
        body: JSON.stringify({
          type: 'youtube_transcribe',
          user_id: userId || "{{user_id}}",
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

      // Wyczyść timeout
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        console.log('✅ YouTube content submitted successfully:', responseData);
        
        if (responseData?.job_id) {
          // Nowa logika z job tracking (Supabase Realtime)
          console.log('✅ Received job_id from Make.com:', responseData.job_id);
          setJobId(responseData.job_id);
          setJobStatus('processing');
          setLoadingTitle('Przetwarzanie...');
          setLoadingDescription('Make.com przetwarza film YouTube. To może potrwać kilka minut.');
          
          toast({
            title: "✅ Zadanie rozpoczęte!",
            description: "Make.com rozpoczął przetwarzanie. Będziemy Cię informować o postępach.",
            duration: 5000,
          });
        } else {
          // Make.com nie zwrócił job_id - prawdopodobnie stary scenariusz
          console.log('⚠️ No job_id received - Make.com scenario needs update');
          setJobStatus('failed');
          setErrorMessage('Make.com nie zwrócił ID zadania. Scenariusz wymaga aktualizacji.');
          setLoadingModalOpen(false);
          
          toast({
            title: "⚠️ Wymagana aktualizacja",
            description: "Scenariusz Make.com wymaga aktualizacji aby zwracał job_id. Skontaktuj się z administratorem.",
            variant: "destructive",
            duration: 10000,
          });
        }
      } else {
        // Obsługa błędów HTTP
        const errorText = await response.text().catch(() => 'Nieznany błąd');
        console.error('HTTP Error:', response.status, errorText);
        
        let errorMessage = 'Nie udało się wysłać żądania do Make.com';
        if (response.status === 400) {
          errorMessage = '🔧 Make.com: Nieprawidłowe dane wejściowe - sprawdź format URL YouTube';
        } else if (response.status === 401) {
          errorMessage = '🔐 Make.com: Błąd autoryzacji - webhook może być nieaktywny';
        } else if (response.status === 403) {
          errorMessage = '🚫 Make.com: Brak uprawnień - scenariusz może być wyłączony';
        } else if (response.status === 404) {
          errorMessage = '❌ Make.com: Webhook nie istnieje - sprawdź URL webhook';
        } else if (response.status === 429) {
          errorMessage = '⏳ Make.com: Zbyt wiele żądań - poczekaj chwilę i spróbuj ponownie';
        } else if (response.status >= 500) {
          errorMessage = '🔥 Make.com: Błąd serwera - scenariusz może być przeciążony';
        }
        
        // Zamknij loading modal przed pokazaniem błędu
        setLoadingModalOpen(false);
        
        toast({
          title: "🚨 Błąd YouTube Transcriber",
          description: `${errorMessage} (${response.status})\n\n💡 Spróbuj ponownie za kilka minut lub skontaktuj się z administratorem.`,
          variant: "destructive",
          duration: 15000, // 15 sekund
        });
      }
    } catch (error) {
      console.error('❌ Error submitting YouTube content:', error);
      
      let errorMessage = 'Nie udało się przetworzyć YouTube';
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorMessage = '⏰ Make.com nie odpowiedział w ciągu 30 sekund.\n\n🔍 Możliwe przyczyny:\n• Scenariusz Make.com jest wyłączony\n• Webhook nie działa\n• Make.com jest przeciążony\n\n💡 Sprawdź Make.com lub spróbuj ponownie za 10 minut.';
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '🌐 Błąd połączenia z Make.com.\n\n🔍 Sprawdź:\n• Połączenie internetowe\n• Czy webhook Make.com jest aktywny\n• Czy URL webhook jest prawidłowy';
      } else if (error instanceof Error) {
        errorMessage = `❌ Błąd: ${error.message}\n\n💡 Sprawdź Make.com lub spróbuj ponownie.`;
      }
      
      // Set error state
      setJobStatus('failed');
      setErrorMessage(errorMessage);
      setLoadingModalOpen(false);
      
      toast({
        title: "🚨 Problem z Make.com",
        description: `${getDetailedErrorMessage(error, "przetwarzania YouTube")}\n\n⚠️ WAŻNE: Make.com może mieć błąd w module, ale aplikacja o tym nie wie!\n\n💡 Sprawdź Make.com bezpośrednio lub spróbuj ponownie za 10 minut.`,
        variant: "destructive",
        duration: 20000, // 20 sekund
      });
    } finally {
      console.log('🏁 YouTube Transcriber finished, closing loading modal');
      // Wyczyść timeout jeśli jeszcze nie został wyczyszczony
      clearTimeout(timeoutId);
      setLoading(false);
      // Don't close loading modal here if we have a job_id - let Realtime handle it
      if (!jobId) {
        setLoadingModalOpen(false);
      }
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
      <LoadingModal
        isOpen={loadingModalOpen}
        title={loadingTitle}
        description={loadingDescription}
      />
    </Dialog>
  );
};