
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
import { supabase } from '@/integrations/supabase/client';
import type { Script } from '@/lib/supabase';

interface EditScriptModalProps {
  script: Script | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (script: Script) => void;
}

export const EditScriptModal: React.FC<EditScriptModalProps> = ({ script, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scriptType, setScriptType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
      setScriptType(script.script_type);
      // Prefer multiple possible fields for thumbnail compatibility
      // image_url (DB), thumbnail_url/thumbnailUrl (webhook), imageUrl (legacy)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawUrl = (script.image_url || (script as any).image_url_text || (script as any).thumbnail_url || (script as any).thumbnailUrl || (script as any).imageUrl || '') as string;
      const normalized = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^"|"$/g, '') : '';
      setImageUrl(normalized);
    }
  }, [script]);

  const handleRegenerate = async () => {
    if (!script) return;
    
    setRegenerating(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          postId: script.id, 
          type: 'regenerate_script',
          currentTitle: title,
          currentContent: content,
          scriptType: scriptType,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt zostanie zregenerowany",
        });
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować skryptu",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!script) return;
    setRegenerating(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: script.id, 
          type: 'regenerate_image'
        })
      });
      if (response.ok) {
        toast({ title: 'Sukces', description: 'Obraz zostanie zregenerowany' });
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({ title: 'Błąd', description: 'Nie udało się zregenerować obrazu', variant: 'destructive' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!script) return;
    setRegenerating(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          postId: script.id, 
          type: 'regenerate_all',
          currentTitle: title,
          currentContent: content,
          scriptType: scriptType,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
        })
      });
      if (response.ok) {
        toast({ title: 'Sukces', description: 'Skrypt i obraz zostaną zregenerowane' });
      }
    } catch (error) {
      console.error('Error regenerating all:', error);
      toast({ title: 'Błąd', description: 'Nie udało się zregenerować', variant: 'destructive' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('script-images')
        .upload(`${Date.now()}-${file.name}`, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('script-images')
        .getPublicUrl(data.path);
      
      setImageUrl(publicUrl);
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

  const handleSave = async () => {
    if (!script) return;
    
    setLoading(true);
    try {
      const updatedScript = {
        ...script,
        title,
        content,
        script_type: scriptType,
        image_url: imageUrl
      };
      
      onSave(updatedScript);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować skryptu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar form-container">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Edytuj skrypt
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="hover:bg-secondary/10 hover:text-secondary text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate skrypt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateImage}
              disabled={regenerating}
              className="hover:bg-secondary/10 hover:text-secondary text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate obraz
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateAll}
              disabled={regenerating}
              className="hover:bg-primary/10 hover:text-primary text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate wszystko
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="edit-script-title" className="text-lg font-semibold text-foreground">Tytuł</Label>
            <Input
              id="edit-script-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł skryptu..."
              className="input-field text-lg p-4 h-12 mt-2 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Ukryto pole status/typ skryptu na prośbę użytkownika */}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-lg font-semibold text-foreground">Thumbnail</Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
                className="hidden"
                id="script-image-upload"
                disabled={uploadingImage}
              />
              {/* Usunięto przycisk przesyłania na życzenie użytkownika */}
              {imageUrl && (
                <a href={imageUrl} download target="_blank" rel="noopener noreferrer" className="ml-2">
                  <Button type="button" variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Pobierz</span>
                  </Button>
                </a>
              )}
            </div>
            <div className="mt-3 flex justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Thumbnail preview"
                  className="w-full max-w-[560px] h-40 md:h-44 object-cover rounded-lg border border-form-container-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  onError={(e) => {
                    // Show subtle placeholder if the URL fails to load
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full max-w-[560px] h-40 md:h-44 flex items-center justify-center rounded-lg border border-dashed border-form-container-border text-muted-foreground';
                    placeholder.textContent = 'Brak miniatury';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              ) : (
                <div className="w-full max-w-[560px] h-40 md:h-44 flex items-center justify-center rounded-lg border border-dashed border-form-container-border text-muted-foreground">
                  Brak miniatury
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="edit-script-content" className="text-lg font-semibold text-foreground">Treść skryptu</Label>
            <Textarea
              id="edit-script-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edytuj treść skryptu..."
              className="input-field text-lg p-6 min-h-96 resize-none mt-2 text-white placeholder:text-gray-400"
              rows={16}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6 py-3"
            >
              Zamknij
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-6 py-3"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Image Lightbox Modal */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Enlarged thumbnail" 
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
