import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Upload, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/integrations/supabase/client';
import { InstructionModal } from './InstructionModal';
import type { Caption } from '@/lib/supabase';

interface EditCaptionModalProps {
  caption: Caption | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: Caption) => void;
}

export const EditCaptionModal: React.FC<EditCaptionModalProps> = ({ caption, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [instructionType, setInstructionType] = useState<'regenerate' | 'regenerate_image' | 'regenerate_all'>('regenerate');
  const [pendingInstructions, setPendingInstructions] = useState('');
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();

  useEffect(() => {
    if (caption) {
      setTitle(caption.title);
      setContent(caption.content);
      setPlatform(caption.platform || '');
      setImageUrl(caption.image_url || '');
    }
  }, [caption]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `captions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
      toast({
        title: "Sukces",
        description: "Obraz został przesłany",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać obrazu",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRegenerate = () => {
    setInstructionType('regenerate');
    setInstructionModalOpen(true);
  };

  const handleRegenerateImage = () => {
    setInstructionType('regenerate_image');
    setInstructionModalOpen(true);
  };

  const handleRegenerateAll = () => {
    setInstructionType('regenerate_all');
    setInstructionModalOpen(true);
  };

  const handleInstructionSubmit = async (instructions: string) => {
    if (!caption) return;

    setLoading(true);
    try {
      const payload = {
        user_id: userId || "{{user_id}}",
        action: "regenerate_caption",
        record_id: caption.id,
        caption_id: caption.id,
        title: caption.title,
        content: caption.content,
        platform: caption.platform,
        image_url: caption.image_url,
        instructions: instructions,
        settings: {
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        }
      };

      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Caption zostanie wygenerowany ponownie",
        });
      } else {
        throw new Error('Failed to regenerate caption');
      }
    } catch (error) {
      console.error('Error regenerating caption:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować caption ponownie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInstructionModalOpen(false);
    }
  };

  const handleImageInstructionSubmit = async (instructions: string) => {
    if (!caption) return;

    setLoading(true);
    try {
      const payload = {
        user_id: userId || "{{user_id}}",
        action: "regenerate_caption_image",
        record_id: caption.id,
        caption_id: caption.id,
        title: caption.title,
        content: caption.content,
        platform: caption.platform,
        image_url: caption.image_url,
        image_prompt: caption.image_url, // Use existing image as prompt
        instructions: instructions,
        settings: {
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        }
      };

      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Obraz caption zostanie wygenerowany ponownie",
        });
      } else {
        throw new Error('Failed to regenerate caption image');
      }
    } catch (error) {
      console.error('Error regenerating caption image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować obrazu ponownie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInstructionModalOpen(false);
    }
  };

  const handleAllInstructionSubmit = async (instructions: string) => {
    if (!caption) return;

    setLoading(true);
    try {
      // First regenerate caption
      const captionPayload = {
        user_id: userId || "{{user_id}}",
        action: "regenerate_caption",
        record_id: caption.id,
        caption_id: caption.id,
        title: caption.title,
        content: caption.content,
        platform: caption.platform,
        image_url: caption.image_url,
        instructions: instructions,
        settings: {
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        }
      };

      await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captionPayload)
      });

      // Then regenerate image
      const imagePayload = {
        user_id: userId || "{{user_id}}",
        action: "regenerate_caption_image",
        record_id: caption.id,
        caption_id: caption.id,
        title: caption.title,
        content: caption.content,
        platform: caption.platform,
        image_url: caption.image_url,
        image_prompt: caption.image_url,
        instructions: instructions,
        settings: {
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        }
      };

      await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagePayload)
      });

      toast({
        title: "Sukces",
        description: "Caption i obraz zostaną wygenerowane ponownie",
      });
    } catch (error) {
      console.error('Error regenerating all:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować ponownie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInstructionModalOpen(false);
    }
  };

  const handleSave = () => {
    if (!caption) return;

    const updatedCaption: Caption = {
      ...caption,
      title,
      content,
      platform,
      image_url: imageUrl,
      updated_at: new Date().toISOString()
    };

    onSave(updatedCaption);
  };

  const handleDownload = () => {
    if (!content) return;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'caption'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!caption) return;
    setPublishing(true);
    try {
      // Send to webhook first
      const webhookResponse = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'opublikuj_caption',
          record_id: caption.id,
          id: caption.id,
          title: title,
          content: content,
          platform: platform,
          status: caption.status || 'draft',
          image_url: imageUrl,
          created_at: caption.created_at,
          updated_at: new Date().toISOString(),
          // Dodatkowe pola
          tytul: title,
          tresc_caption: content,
          platforma: platform,
        })
      });

      if (webhookResponse.ok) {
        toast({
          title: "Sukces",
          description: "Caption został wysłany do publikacji",
        });
      }

      // Update local caption
      const updatedCaption = {
        ...caption,
        title,
        content,
        platform,
        image_url: imageUrl,
        status: 'published'
      };
      onSave(updatedCaption);
    } catch (error) {
      console.error('Error publishing caption:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się opublikować caption",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Edytuj Caption
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Content Section */}
            <div className="space-y-4">
              <Label htmlFor="edit-caption-content" className="text-lg font-semibold">Treść Caption</Label>
              <Textarea
                id="edit-caption-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edytuj treść caption..."
                className="input-field text-lg p-6 min-h-[500px] resize-none mt-2 text-white placeholder:text-gray-400 hide-scrollbar"
                rows={25}
              />
            </div>

            {/* Thumbnail Section */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Miniatura</Label>
              <div className="flex items-center space-x-4">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Caption thumbnail"
                      className="w-48 h-48 object-cover rounded-lg border border-form-container-border"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-pink-100 border border-form-container-border rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Brak obrazu</span>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={uploadingImage}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingImage ? 'Przesyłanie...' : 'Prześlij obraz'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Title and Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-caption-title" className="text-lg font-semibold">Tytuł</Label>
                <Input
                  id="edit-caption-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Wprowadź tytuł caption..."
                  className="input-field text-lg p-4 h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-caption-platform" className="text-lg font-semibold">Platforma</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="input-field text-lg p-4 h-12">
                    <SelectValue placeholder="Wybierz platformę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="X">X (Twitter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                onClick={handleRegenerate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regeneruj treść</span>
              </Button>
              
              <Button
                onClick={handleRegenerateImage}
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 text-sm flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regeneruj obraz</span>
              </Button>
              
              <Button
                onClick={handleRegenerateAll}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-sm flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regeneruj wszystko</span>
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={publishing || !title.trim() || !content.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-6 py-3 font-semibold"
              >
                {publishing ? 'Publikowanie...' : 'Opublikuj'}
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={loading || !title.trim() || !content.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-6 py-3 font-semibold"
              >
                Zapisz zmiany
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InstructionModal
        isOpen={instructionModalOpen}
        onClose={() => setInstructionModalOpen(false)}
        onSubmit={instructionType === 'regenerate' ? handleInstructionSubmit : 
                  instructionType === 'regenerate_image' ? handleImageInstructionSubmit : 
                  handleAllInstructionSubmit}
        type={instructionType}
      />
    </>
  );
};
