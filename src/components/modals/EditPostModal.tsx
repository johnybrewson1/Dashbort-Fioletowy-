
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
  const { settings } = useSettings();

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
    
    setRegeneratingPost(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          postId: post.id, 
          type: 'regenerate_post',
          currentTitle: title,
          currentContent: content,
          platform: platform,
          platforma: platform,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
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
    
    setRegeneratingImage(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: post.id, 
          type: 'regenerate_image'
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

  const handleRegenerateAll = async () => {
    if (!post) return;
    
    setRegeneratingAll(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          postId: post.id, 
          type: 'regenerate_all',
          currentTitle: title,
          currentContent: content,
          platform: platform,
          platforma: platform,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
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
        description: "Nie udało się zregenerować postu",
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
      const updatedPost = {
        ...post,
        title,
        content,
        platform,
        image_url: imageUrl,
        status: 'published'
      };
      onSave(updatedPost);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar form-container">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Edytuj Post
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegeneratePost}
              disabled={regeneratingPost}
              className="hover:bg-secondary/10 hover:text-secondary text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regeneratingPost ? 'animate-spin' : ''}`} />
              Regenerate post
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateImage}
              disabled={regeneratingImage}
              className="hover:bg-secondary/10 hover:text-secondary text-foreground"
            >
              <Image className={`w-4 h-4 mr-2 ${regeneratingImage ? 'animate-spin' : ''}`} />
              Regenerate obraz
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerateAll}
              disabled={regeneratingAll}
              className="hover:bg-primary/10 hover:text-primary text-foreground"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regeneratingAll ? 'animate-spin' : ''}`} />
              Regenerate wszystko
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {publishing ? 'Publikowanie...' : 'Opublikuj'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
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
                  className="w-full max-w-[560px] h-40 md:h-44 object-cover rounded-lg border border-form-container-border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setImageModalOpen(true)}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>


          <div>
            <Label htmlFor="edit-content" className="text-lg font-semibold text-foreground">Treść postu</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edytuj treść postu..."
              className="input-field text-lg p-6 min-h-64 resize-none mt-2 text-white placeholder:text-gray-400"
              rows={12}
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
              alt="Enlarged post image" 
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
