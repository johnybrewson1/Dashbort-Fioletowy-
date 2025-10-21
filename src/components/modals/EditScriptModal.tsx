
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
import { LoadingModal } from '@/components/ui/LoadingModal';
import type { Script } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/config';

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
  const [publishing, setPublishing] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  
  // Instruction modals
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [instructionType, setInstructionType] = useState<'script' | 'image' | 'all'>('script');
  const [pendingInstructions, setPendingInstructions] = useState<string[]>([]);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [loadingDescription, setLoadingDescription] = useState('');
  
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();

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
    
    setInstructionType('script');
    setInstructionModalOpen(true);
  };

  const handleRegenerateImage = async () => {
    if (!script) return;
    
    setInstructionType('image');
    setInstructionModalOpen(true);
  };

  const handleRegenerateAll = async () => {
    if (!script) return;
    
    setInstructionType('all');
    setInstructionModalOpen(true);
  };

  const handleInstructionSubmit = async (instructions: string) => {
    if (!script) return;
    
    setRegenerating(true);
    setLoadingModalOpen(true);
    setLoadingTitle('Regenerowanie skryptu...');
    setLoadingDescription('AI analizuje Twoje instrukcje i tworzy nowy skrypt.');
    
    try {
      const response = await fetch(buildApiUrl('/api/regenerate-script'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_script',
          // Wszystkie dane z tabeli scripts
          record_id: script.id,
          id: script.id,
          title: title,
          content: content,
          script_type: scriptType,
          platform: script.platform || 'youtube',
          status: script.status || 'draft',
          image_url: imageUrl,
          created_at: script.created_at,
          updated_at: new Date().toISOString(),
          // Instrukcje
          instructions: instructions,
          // Dodatkowe pola dla kompatybilności
          image_prompt: (script as any).image_prompt || '',
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt zostanie zregenerowany z instrukcjami",
        });
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      // Zamknij loading modal przed pokazaniem błędu
      setLoadingModalOpen(false);
      
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować skryptu",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
      setLoadingModalOpen(false);
    }
  };

  const handleImageInstructionSubmit = async (instructions: string) => {
    if (!script) return;
    
    setRegenerating(true);
    try {
      const response = await fetch(buildApiUrl('/api/regenerate-thumbnail'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_thumbnail',
          // Wszystkie dane z tabeli scripts
          record_id: script.id,
          id: script.id,
          title: title,
          content: content,
          script_type: scriptType,
          platform: script.platform || 'youtube',
          status: script.status || 'draft',
          image_url: imageUrl,
          created_at: script.created_at,
          updated_at: new Date().toISOString(),
          // Instrukcje
          instructions: instructions,
          image_prompt: (script as any).image_prompt || ''
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Obraz zostanie zregenerowany z instrukcjami",
        });
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      // Zamknij loading modal przed pokazaniem błędu
      setLoadingModalOpen(false);
      
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować obrazu",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
      setLoadingModalOpen(false);
    }
  };

  const handleAllInstructionSubmit = async (instructions: string) => {
    if (!script) return;
    
    setRegenerating(true);
    try {
      const response = await fetch(buildApiUrl('/api/regenerate-script-all'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_all',
          // Wszystkie dane z tabeli scripts
          record_id: script.id,
          id: script.id,
          title: title,
          content: content,
          script_type: scriptType,
          platform: script.platform || 'youtube',
          status: script.status || 'draft',
          image_url: imageUrl,
          created_at: script.created_at,
          updated_at: new Date().toISOString(),
          // Instrukcje
          instructions: instructions,
          // Dodatkowe pola dla kompatybilności
          image_prompt: (script as any).image_prompt || '',
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt i obraz zostaną zregenerowane z instrukcjami",
        });
      }
    } catch (error) {
      console.error('Error regenerating all:', error);
      // Zamknij loading modal przed pokazaniem błędu
      setLoadingModalOpen(false);
      
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować",
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
      setLoadingModalOpen(false);
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

  const handlePublish = async () => {
    if (!script) return;
    setPublishing(true);
    setLoadingModalOpen(true);
    setLoadingTitle('Publikowanie skryptu...');
    setLoadingDescription('Wysyłanie do Make.com i aktualizacja statusu.');
    
    try {
      // Send to webhook first
      const webhookResponse = await fetch(buildApiUrl('/api/publish-script'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'opublikuj_script',
          record_id: script.id,
          id: script.id,
          title: title,
          content: content,
          script_type: scriptType,
          platform: script.platform || 'youtube',
          status: script.status || 'draft',
          image_url: imageUrl,
          created_at: script.created_at,
          updated_at: new Date().toISOString(),
          // Dodatkowe pola
          tytul: title,
          tresc_script: content,
          typ_script: scriptType,
        })
      });

      if (webhookResponse.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt został wysłany do publikacji",
        });
      }

      // Update local script
      const updatedScript = {
        ...script,
        title,
        content,
        script_type: scriptType,
        image_url: imageUrl,
        status: 'published'
      };
      onSave(updatedScript);
    } catch (error) {
      console.error('Error publishing script:', error);
      // Zamknij loading modal przed pokazaniem błędu
      setLoadingModalOpen(false);
      
      toast({
        title: "Błąd",
        description: "Nie udało się opublikować skryptu",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
      setLoadingModalOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto form-container hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Edytuj skrypt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Textarea
              id="edit-script-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edytuj treść skryptu..."
              className="input-field text-lg p-6 h-[500px] resize-none mt-2 text-white placeholder:text-gray-400 overflow-y-auto hide-scrollbar"
              rows={25}
            />
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
              <div className="flex gap-2">
              </div>
            </div>
          </div>

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

          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regeneruj treść</span>
            </Button>
            <Button
              onClick={handleRegenerateImage}
              disabled={regenerating}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regeneruj obraz</span>
            </Button>
            <Button
              onClick={handleRegenerateAll}
              disabled={regenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>Regeneruj wszystko</span>
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-6 py-3 font-semibold"
            >
              {publishing ? 'Publikowanie...' : 'Opublikuj'}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-6 py-3 font-semibold"
            >
              {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
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

      <InstructionModal
        isOpen={instructionModalOpen}
        onClose={() => setInstructionModalOpen(false)}
        onSubmit={instructionType === 'script' ? handleInstructionSubmit : 
                  instructionType === 'image' ? handleImageInstructionSubmit : 
                  handleAllInstructionSubmit}
        title={instructionType === 'script' ? 'Regenerate skrypt' : 
               instructionType === 'image' ? 'Regenerate obraz' : 
               'Regenerate wszystko'}
      />

      <LoadingModal
        isOpen={loadingModalOpen}
        title={loadingTitle}
        description={loadingDescription}
      />
    </Dialog>
  );
};
