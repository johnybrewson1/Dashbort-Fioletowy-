
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Upload } from 'lucide-react';
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
  const [regenerating, setRegenerating] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (script) {
      setTitle(script.title);
      setContent(script.content);
      setScriptType(script.script_type);
      setImageUrl(script.image_url || '');
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar form-container">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Edytuj skrypt
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            className="hover:bg-secondary/10 hover:text-secondary text-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate cały skrypt
          </Button>
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

          <div>
            <Label htmlFor="edit-script-type" className="text-lg font-semibold text-foreground">Status</Label>
            <Select value={scriptType} onValueChange={setScriptType}>
              <SelectTrigger className="input-field text-lg p-4 h-12 mt-2 text-white">
                <SelectValue placeholder="Wybierz typ skryptu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Szkic">Szkic</SelectItem>
                <SelectItem value="Haczyki">Haczyki</SelectItem>
                <SelectItem value="Krótki Skrypt">Krótki Skrypt</SelectItem>
                <SelectItem value="Instagram Captions">Instagram Captions</SelectItem>
                <SelectItem value="YouTube Captions">YouTube Captions</SelectItem>
                <SelectItem value="TikTok Captions">TikTok Captions</SelectItem>
                <SelectItem value="Średni skrypt">Średni skrypt</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              <label htmlFor="script-image-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  className="flex items-center space-x-2"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Pobieranie...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Pobierz</span>
                    </>
                  )}
                </Button>
              </label>
            </div>
            {imageUrl && (
              <div className="mt-3">
                <img
                  src={imageUrl}
                  alt="Thumbnail preview"
                  className="w-full h-64 object-cover rounded-lg border border-form-container-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
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
    </Dialog>
  );
};
