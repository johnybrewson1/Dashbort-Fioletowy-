import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Sparkles } from 'lucide-react';
import { useSupabasePosts } from '@/hooks/useSupabaseData';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import type { Post } from '@/lib/supabase';

export const SupabasePostsSection: React.FC = () => {
  const { posts, loading, error, loadPosts, updatePost, deletePost } = useSupabasePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { settings } = useSettings();

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
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-platform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Posty</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {posts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <h4 className="font-medium text-foreground mb-2 line-clamp-1">{post.title}</h4>
                      
                      {post.image ? (
                        <div className="mb-3 relative">
                          <img 
                            src={post.image} 
                            alt={`Thumbnail for ${post.title}`}
                            className="w-full h-32 object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      ) : (
                        <div className="mb-3 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 border border-form-container-border rounded-lg flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-blue-400 opacity-60" />
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {post.content || "Brak treści postu"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {post.shouldPublish ? 'published' : 'draft'}
                        </Badge>
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
    </>
  );
};