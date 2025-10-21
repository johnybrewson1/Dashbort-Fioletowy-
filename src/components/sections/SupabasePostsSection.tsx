import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Sparkles, Search } from 'lucide-react';
import { useSupabasePosts } from '@/hooks/useSupabaseData';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { ImageModal } from '@/components/ui/ImageModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { formatDateTime } from '@/lib/dateUtils';
import type { Post } from '@/lib/supabase';

export const SupabasePostsSection: React.FC = () => {
  const { posts, loading, error, updatePost, deletePost } = useSupabasePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();

  // Debug: Log posts and their image_url
  React.useEffect(() => {
    console.log('All posts:', posts);
    posts.forEach(post => {
      console.log(`Post "${post.title}": image_url = "${post.image_url}"`);
    });
  }, [posts]);

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      toast({
        title: "Sukces",
        description: "Post został usunięty",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć postu",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (imageUrl: string, alt: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageAlt(alt);
    setIsImageModalOpen(true);
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedPost: Post) => {
    try {
      await updatePost(updatedPost.id, updatedPost);
      toast({ title: "Sukces", description: "Post został zaktualizowany" });
      setIsEditModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować postu", variant: "destructive" });
    }
  };


  if (loading) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Ładowanie postów...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Błąd: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak postów. Stwórz pierwszy post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post.id} 
                  className="group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleEdit(post)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="platform-selected text-xs">
                        {post.platform}
                      </Badge>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {post.image_url && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(post.image_url, `Thumbnail for ${post.title}`);
                            }}
                            className="hover:bg-blue-500/10 hover:text-blue-500 h-8 w-8"
                            title="Powiększ obraz"
                          >
                            <Search className="w-3 h-3" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          title="Usuń post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-foreground mb-4 line-clamp-2 text-center">{post.title}</h4>
                      
                      {post.image_url ? (
                        <div className="relative">
                          <img
                            src={post.image_url}
                            alt={`Thumbnail for ${post.title}`}
                            className="w-full aspect-square object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-32"
                            onClick={() => handleImageClick(post.image_url, `Thumbnail for ${post.title}`)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 border border-form-container-border rounded-lg flex items-center justify-center h-32">
                          <Sparkles className="w-8 h-8 text-blue-400 opacity-60" />
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t border-form-container-border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Utworzono: {formatDateTime(post.created_at)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            draft
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <EditPostModal
        post={selectedPost}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPost(null);
        }}
        onSave={handleSave}
      />
      
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImageUrl}
        alt={selectedImageAlt}
      />
    </>
  );
};