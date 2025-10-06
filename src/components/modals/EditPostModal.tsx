
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Image, Upload, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/lib/supabase';
import { InstructionModal } from './InstructionModal';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

interface EditPostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regeneratingPost, setRegeneratingPost] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Instruction modals
  const [instructionModalOpen, setInstructionModalOpen] = useState(false);
  const [instructionType, setInstructionType] = useState<'post' | 'image' | 'all'>('post');
  const [pendingInstructions, setPendingInstructions] = useState<string[]>([]);
  
  // Two separate modals for "regenerate all"
  const [postInstructionModalOpen, setPostInstructionModalOpen] = useState(false);
  const [imageInstructionModalOpen, setImageInstructionModalOpen] = useState(false);
  const [postInstructions, setPostInstructions] = useState('');
  const [imageInstructions, setImageInstructions] = useState('');
  
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setPlatform(post.platform);
      setImageUrl(post.image_url || '');
    }
  }, [post]);

  const handleRegeneratePost = async () => {
    if (!post) return;
    
    setInstructionType('post');
    setInstructionModalOpen(true);
  };

  const handleInstructionSubmit = async (instructions: string) => {
    if (!post) return;
    
    setRegeneratingPost(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_post',
          record_id: post.id,
          id: post.id,
          title: title,
          content: content,
          platform: platform,
          status: post.status || 'draft',
          image_url: imageUrl,
          created_at: post.created_at,
          updated_at: new Date().toISOString(),
          // Format Post/Filmy/Captions
          Post: {
            instagram: platform?.toLowerCase() === 'instagram',
            linkedin: platform?.toLowerCase() === 'linkedin',
            x: platform?.toLowerCase() === 'x',
            facebook: platform?.toLowerCase() === 'facebook',
            blog: platform?.toLowerCase() === 'blog'
          },
          Filmy: {
            "Haczyki": false,
            "Thumbnail": false,
            "Krótki skrypt": false,
            "Średni skrypt": false
          },
          Captions: {
            "TikTok": false,
            "YouTube": false,
            "Instagram": false
          },
          // Ustawienia użytkownika
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
          instructions: instructions
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Post zostanie zregenerowany",
        });
      }
    } catch (error) {
      console.error('Error regenerating post:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować postu",
        variant: "destructive",
      });
    } finally {
      setRegeneratingPost(false);
    }
  };

  const handleRegenerateImage = async () => {
    if (!post) return;
    
    setInstructionType('image');
    setInstructionModalOpen(true);
  };

  const handleImageInstructionSubmit = async (instructions: string) => {
    if (!post) return;
    
    setRegeneratingImage(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_image',
          record_id: post.id,
          id: post.id,
          title: title,
          content: content,
          platform: platform,
          status: post.status || 'draft',
          image_url: imageUrl,
          created_at: post.created_at,
          updated_at: new Date().toISOString(),
          // Format Post/Filmy/Captions
          Post: {
            instagram: platform?.toLowerCase() === 'instagram',
            linkedin: platform?.toLowerCase() === 'linkedin',
            x: platform?.toLowerCase() === 'x',
            facebook: platform?.toLowerCase() === 'facebook',
            blog: platform?.toLowerCase() === 'blog'
          },
          Filmy: {
            "Haczyki": false,
            "Thumbnail": false,
            "Krótki skrypt": false,
            "Średni skrypt": false
          },
          Captions: {
            "TikTok": false,
            "YouTube": false,
            "Instagram": false
          },
          // Ustawienia użytkownika
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
          image_prompt: (post as any).image_prompt || '',
          instructions: instructions
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Obraz zostanie zregenerowany",
        });
      }
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować obrazu",
        variant: "destructive",
      });
    } finally {
      setRegeneratingImage(false);
    }
  };

  const handleAllInstructionSubmit = async (instructions: string) => {
    if (!post) return;
    
    setRegeneratingAll(true);
    try {
      // Najpierw regeneruj post
      const postResponse = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_post',
          record_id: post.id,
          id: post.id,
          title: title,
          content: content,
          platform: platform,
          status: post.status || 'draft',
          image_url: imageUrl,
          created_at: post.created_at,
          updated_at: new Date().toISOString(),
          // Format Post/Filmy/Captions
          Post: {
            instagram: platform?.toLowerCase() === 'instagram',
            linkedin: platform?.toLowerCase() === 'linkedin',
            x: platform?.toLowerCase() === 'x',
            facebook: platform?.toLowerCase() === 'facebook',
            blog: platform?.toLowerCase() === 'blog'
          },
          Filmy: {
            "Haczyki": false,
            "Thumbnail": false,
            "Krótki skrypt": false,
            "Średni skrypt": false
          },
          Captions: {
            "TikTok": false,
            "YouTube": false,
            "Instagram": false
          },
          // Ustawienia użytkownika
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
          instructions: instructions
        })
      });

      if (postResponse.ok) {
        // Potem regeneruj obraz
        const imageResponse = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: userId || "{{user_id}}",
            source_type: 'regenerate_image',
            record_id: post.id,
            id: post.id,
            title: title,
            content: content,
            platform: platform,
            status: post.status || 'draft',
            image_url: imageUrl,
            created_at: post.created_at,
            updated_at: new Date().toISOString(),
            // Format Post/Filmy/Captions
            Post: {
              instagram: platform === 'Instagram',
              linkedin: platform === 'LinkedIn',
              x: platform === 'X',
              facebook: platform === 'Facebook',
              blog: platform === 'Blog'
            },
            Filmy: {
              "Haczyki": false,
              "Thumbnail": false,
              "Krótki skrypt": false,
              "Średni skrypt": false
            },
            Captions: {
              "TikTok": false,
              "YouTube": false,
              "Instagram": false
            },
            // Ustawienia użytkownika
            voiceForPosts: settings.voiceForPosts,
            voiceForScripts: settings.voiceForScripts, 
            style: settings.style,
            avatarRecipient: settings.avatarRecipient,
            brandDescription: settings.brandDescription,
            language: settings.language,
            image_prompt: (post as any).image_prompt || '',
            instructions: instructions
          })
        });

        if (imageResponse.ok) {
          toast({
            title: "Sukces",
            description: "Post i obraz zostaną zregenerowane",
          });
        }
      }
    } catch (error) {
      console.error('Error regenerating all:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować postu i obrazu",
        variant: "destructive",
      });
    } finally {
      setRegeneratingAll(false);
    }
  };

  const handleRegenerateAll = () => {
    setPostInstructions('');
    setImageInstructions('');
    setPostInstructionModalOpen(true);
  };

  const handlePostInstructionSubmit = (instructions: string) => {
    setPostInstructions(instructions);
    setPostInstructionModalOpen(false);
    setImageInstructionModalOpen(true);
  };

  const handleImageInstructionSubmitForAll = async () => {
    if (!post) return;
    
    console.log('Platform value:', platform);
    console.log('Platform type:', typeof platform);
    
    setRegeneratingAll(true);
    setImageInstructionModalOpen(false);
    
    try {
      const response = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId || "{{user_id}}",
          source_type: 'regenerate_all',
          record_id: post.id,
          id: post.id,
          title: title,
          content: content,
          status: post.status || 'draft',
          image_url: imageUrl,
          created_at: post.created_at,
          updated_at: new Date().toISOString(),
          // Format Post/Filmy/Captions
          Post: {
            instagram: platform?.toLowerCase() === 'instagram',
            linkedin: platform?.toLowerCase() === 'linkedin',
            x: platform?.toLowerCase() === 'x',
            facebook: platform?.toLowerCase() === 'facebook',
            blog: platform?.toLowerCase() === 'blog'
          },
          Filmy: {
            "Haczyki": false,
            "Thumbnail": false,
            "Krótki skrypt": false,
            "Średni skrypt": false
          },
          Captions: {
            "TikTok": false,
            "YouTube": false,
            "Instagram": false
          },
          // Ustawienia użytkownika
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language,
          image_prompt: (post as any).image_prompt || '',
          // Instrukcje dla posta i obrazu
          instructions: postInstructions,
          image_instructions: imageInstructions,
          currentContent: content
        })
      });

      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Post i obraz zostaną zregenerowane",
        });
      }
    } catch (error) {
      console.error('Error regenerating all:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować postu i obrazu",
        variant: "destructive",
      });
    } finally {
      setRegeneratingAll(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(`${Date.now()}-${file.name}`, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
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
    if (!post) return;
    
    setLoading(true);
    try {
      const updatedPost = {
        ...post,
        title,
        content,
        platform,
        image_url: imageUrl
      };
      
      onSave(updatedPost);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować postu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!post) return;
    setPublishing(true);
    try {
      // Send to webhook first
      const webhookResponse = await fetch('https://hook.eu2.make.com/ujque49m1ce27pl79ut5btv34aevg8yl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || "{{user_id}}",
          source_type: 'opublikuj',
          // Wszystkie dane z tabeli posts
          record_id: post.id,
          id: post.id,
          title: title,
          content: content,
          platform: platform,
          status: post.status || 'draft',
          image_url: imageUrl,
          created_at: post.created_at,
          updated_at: new Date().toISOString(),
          // Dodatkowe pola dla kompatybilności
          tytul: title,
          tresc_posta: content,
          platforma: platform,
          // Platforma z 4 kategoriami
          Platforma: {
            Instagram: platform?.toLowerCase() === 'instagram',
            Linkedin: platform?.toLowerCase() === 'linkedin',
            X: platform?.toLowerCase() === 'x',
            Facebook: platform?.toLowerCase() === 'facebook'
          }
        })
      });

      if (webhookResponse.ok) {
        toast({
          title: "Sukces",
          description: "Post został wysłany do publikacji",
        });
      }

      // Update local post
      const updatedPost = {
        ...post,
        title,
        content,
        platform,
        image_url: imageUrl,
        status: 'published'
      };
      onSave(updatedPost);
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się opublikować postu",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar form-container">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Edytuj post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="edit-content" className="text-lg font-semibold text-foreground">Treść postu</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edytuj treść postu..."
              className="input-field text-lg p-6 min-h-[500px] resize-none mt-2 text-white placeholder:text-gray-400 hide-scrollbar"
              rows={25}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-lg font-semibold text-foreground">Obraz</Label>
              {imageUrl && (
                <a href={imageUrl} download target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Pobierz</span>
                  </Button>
                </a>
              )}
            </div>
            {imageUrl && (
              <div className="mt-3 flex justify-center">
                <img
                  src={imageUrl}
                  alt="Image preview"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  className="w-48 h-48 object-cover rounded-lg border border-form-container-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-title" className="text-lg font-semibold text-foreground">Tytuł</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł postu..."
              className="input-field text-lg p-4 h-12 mt-2 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="edit-platform" className="text-lg font-semibold text-foreground">Platforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="input-field text-lg p-4 h-12 mt-2 text-white">
                <SelectValue placeholder="Wybierz platformę" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="X">X</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Button
              onClick={handleRegeneratePost}
              disabled={regeneratingPost}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regeneratingPost ? 'animate-spin' : ''}`} />
              <span>Regeneruj treść</span>
            </Button>
            <Button
              onClick={handleRegenerateImage}
              disabled={regeneratingImage}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regeneratingImage ? 'animate-spin' : ''}`} />
              <span>Regeneruj obraz</span>
            </Button>
            <Button
              onClick={handleRegenerateAll}
              disabled={regeneratingAll}
              className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-sm flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${regeneratingAll ? 'animate-spin' : ''}`} />
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
              alt="Enlarged post image" 
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Instruction Modal */}
      <InstructionModal
        isOpen={instructionModalOpen}
        onClose={() => setInstructionModalOpen(false)}
        onSubmit={instructionType === 'post' ? handleInstructionSubmit : 
                 instructionType === 'image' ? handleImageInstructionSubmit : 
                 handleAllInstructionSubmit}
        title={instructionType === 'post' ? 'Instrukcje dla regeneracji posta' :
               instructionType === 'image' ? 'Instrukcje dla regeneracji obrazka' :
               'Instrukcje dla regeneracji wszystkiego'}
        placeholder={instructionType === 'post' ? 'Wprowadź instrukcje dla regeneracji treści posta...' :
                   instructionType === 'image' ? 'Wprowadź instrukcje dla regeneracji obrazka...' :
                   'Wprowadź instrukcje dla regeneracji posta...'}
      />

      {/* Post Instruction Modal for "Regenerate All" */}
      <InstructionModal
        isOpen={postInstructionModalOpen}
        onClose={() => setPostInstructionModalOpen(false)}
        onSubmit={handlePostInstructionSubmit}
        title="Instrukcje dla regeneracji treści posta"
        placeholder="Wprowadź instrukcje dla regeneracji treści posta..."
        value={postInstructions}
        onValueChange={setPostInstructions}
      />

      {/* Image Instruction Modal for "Regenerate All" */}
      <InstructionModal
        isOpen={imageInstructionModalOpen}
        onClose={() => setImageInstructionModalOpen(false)}
        onSubmit={handleImageInstructionSubmitForAll}
        title="Instrukcje dla regeneracji obrazka"
        placeholder="Wprowadź instrukcje dla regeneracji obrazka..."
        value={imageInstructions}
        onValueChange={setImageInstructions}
      />
    </Dialog>
  );
};
