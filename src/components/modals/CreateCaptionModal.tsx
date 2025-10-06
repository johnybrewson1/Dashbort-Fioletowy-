import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { supabase } from '@/integrations/supabase/client';
import type { Caption } from '@/lib/supabase';

interface CreateCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (caption: Omit<Caption, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => void;
}

export const CreateCaptionModal: React.FC<CreateCaptionModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userId } = useSupabaseUser();

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

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !platform) {
      toast({
        title: "Błąd",
        description: "Wszystkie pola są wymagane",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newCaption = {
        user_id: userId || '',
        title: title.trim(),
        content: content.trim(),
        platform: platform,
        status: 'draft',
        image_url: imageUrl || null
      };

      await onCreate(newCaption);
      
      // Reset form
      setTitle('');
      setContent('');
      setPlatform('');
      setImageUrl('');
    } catch (error) {
      console.error('Error creating caption:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć caption",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Stwórz Nowy Caption
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="caption-title" className="text-lg font-semibold">Tytuł</Label>
            <Input
              id="caption-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wprowadź tytuł caption..."
              className="input-field text-lg p-4 h-12"
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="caption-platform" className="text-lg font-semibold">Platforma</Label>
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

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="caption-content" className="text-lg font-semibold">Treść Caption</Label>
            <Textarea
              id="caption-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Wprowadź treść caption..."
              className="input-field text-lg p-6 min-h-[300px] resize-none text-white placeholder:text-gray-400"
              rows={12}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Obraz (opcjonalny)</Label>
            <div className="flex items-center space-x-4">
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Caption preview"
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Anuluj
            </Button>
            
            <Button
              onClick={handleCreate}
              disabled={loading || !title.trim() || !content.trim() || !platform}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              {loading ? 'Tworzenie...' : 'Stwórz Caption'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

