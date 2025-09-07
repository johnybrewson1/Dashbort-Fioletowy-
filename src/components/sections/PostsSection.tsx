
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, RefreshCw, Trash2, Sparkles } from 'lucide-react';
import { EditPostModal } from '@/components/modals/EditPostModal';
import { airtableService, Post } from '@/services/airtable';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';

export const PostsSection: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      console.log('Loading posts from Airtable...');
      const postsData = await airtableService.getPosts();
      console.log('Posts loaded:', postsData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować postów",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (postId: string) => {
    try {
      const success = await airtableService.deletePost(postId);
      if (success) {
        toast({
          title: "Sukces",
          description: "Post został usunięty",
        });
        loadPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć postu",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          postId, 
          type: 'regenerate',
          currentTitle: post.title,
          currentContent: post.content,
          platform: post.platform,
          platforma: post.platform,
          image: post.image,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts, 
          style: settings.style,
          avatarRecipient: settings.avatarRecipient
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Post został zregenerowany",
        });
        loadPosts();
      }
    } catch (error) {
      console.error('Error regenerating post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-platform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Posty</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              ({posts.length})
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak postów. Stwórz pierwszy post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => handleEdit(post)}
                  className="border border-form-container-border rounded-lg bg-card/50 hover:bg-card/80 hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer group"
                >
                  <div className="flex items-center justify-between p-3 border-b border-form-container-border">
                    <Badge variant="outline" className="platform-selected">
                      {post.platform}
                    </Badge>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(post)}
                        className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerate(post.id)}
                        disabled={loading}
                        className="hover:bg-secondary/10 hover:text-secondary h-8 w-8"
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                        className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
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
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString('pl-PL')}
                      </span>
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
        onSave={async (updatedPost) => {
          const success = await airtableService.updatePost(updatedPost.id, updatedPost);
          if (success) {
            setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
            toast({
              title: "Sukces",
              description: "Post został zaktualizowany",
            });
          } else {
            toast({
              title: "Błąd",
              description: "Nie udało się zaktualizować postu",
              variant: "destructive",
            });
          }
          setIsEditModalOpen(false);
          setSelectedPost(null);
        }}
      />
    </>
  );
};
