import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MagicContentInput from '@/components/MagicContentInput';
import PlatformMultiSelect from '@/components/PlatformMultiSelect';
import MagicButton from '@/components/MagicButton';
import { useMagicAgent } from '@/hooks/useMagicAgent';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { airtableService, Ranking } from '@/services/airtable';

interface CreateFromRankingModalProps {
  ranking: Ranking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFromRankingModal: React.FC<CreateFromRankingModalProps> = ({ ranking, isOpen, onClose }) => {
  const { settings } = useSettings();
  const {
    content,
    setContent,
    selectedPlatforms,
    selectedContentTypes,
    imageUrl,
    setImageUrl,
    useThumbnail,
    setUseThumbnail,
    loading,
    handleContentTypeChange,
    handlePlatformChange,
    handleSubmit: originalHandleSubmit
  } = useMagicAgent();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Błąd",
        description: "Pole treści jest wymagane",
        variant: "destructive",
      });
      return;
    }

    const hasSelectedPlatform = Object.values(selectedPlatforms).some(Boolean);
    if (!hasSelectedPlatform) {
      toast({
        title: "Błąd", 
        description: "Wybierz przynajmniej jedną platformę",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        źródło: 'ranking',
        content,
        imageUrl,
        platforms: selectedPlatforms,
        contentTypes: selectedContentTypes,
        // Ranking specific data
        rankingId: ranking?.id,
        rankingTitle: ranking?.title,
        rankingRatio: ranking?.ratio,
        rankingVideoUrl: ranking?.videoUrl,
        // Thumbnail data
        useThumbnail,
        thumbnailUrl: useThumbnail ? ranking?.thumbnailUrl : undefined,
        // Additional webhook data as requested
        voiceForPosts: settings.voiceForPosts,
        voiceForScripts: settings.voiceForScripts,
        style: settings.style,
        avatarRecipient: settings.avatarRecipient,
        type: 'create_from_ranking'
      };
      
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
          description: "Twój post został wygenerowany z rankingu!",
        });
        onClose();
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Stwórz z rankingu: {ranking?.title}
          </DialogTitle>
          {ranking && (
            <p className="text-sm text-muted-foreground">
              Ratio: {ranking.ratio}% | <a href={ranking.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Zobacz film</a>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <MagicContentInput value={content} onChange={setContent} variant="ranking" />
          
          <PlatformMultiSelect
            selectedPlatforms={selectedPlatforms}
            selectedContentTypes={selectedContentTypes}
            onPlatformChange={handlePlatformChange}
            onContentTypeChange={handleContentTypeChange}
            imageUrl={imageUrl}
            onImageUrlChange={setImageUrl}
            useThumbnail={useThumbnail}
            onUseThumbnailChange={setUseThumbnail}
          />
          
          <MagicButton onClick={handleSubmit} loading={loading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};