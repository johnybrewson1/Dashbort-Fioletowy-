import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, RefreshCw, Trash2, MessageSquare, Plus } from 'lucide-react';
import { airtableService, Script } from '@/services/airtable';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';

export const CaptionsSection: React.FC = () => {
  const [captions, setCaptions] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaption, setSelectedCaption] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { settings } = useSettings();

  const loadCaptions = async () => {
    try {
      setLoading(true);
      const scriptsData = await airtableService.getScripts();
      
      // Filter only captions (Instagram Captions, YouTube Captions, TikTok Captions)
      const captionsData = scriptsData.filter(script => 
        script.type === 'Instagram Captions' || 
        script.type === 'YouTube Captions' || 
        script.type === 'TikTok Captions'
      );
      
      setCaptions(captionsData);
      setError(null);
    } catch (error) {
      console.error('Error loading captions:', error);
      setError('Failed to load captions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaptions();
  }, []);

  const handleDelete = async (captionId: string) => {
    try {
      const success = await airtableService.deleteScript(captionId);
      if (success) {
        toast({
          title: "Sukces",
          description: "Caption został usunięty",
        });
        loadCaptions();
      }
    } catch (error) {
      console.error('Error deleting caption:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć caption",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (caption: Script) => {
    setSelectedCaption(caption);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedCaption: Script) => {
    try {
      const success = await airtableService.updateScript(updatedCaption.id, updatedCaption);
      if (success) {
        toast({ title: "Sukces", description: "Caption został zaktualizowany" });
        setIsEditModalOpen(false);
        setSelectedCaption(null);
        loadCaptions();
      }
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować caption", variant: "destructive" });
    }
  };

  const handleRegenerate = async (captionId: string) => {
    try {
      setLoading(true);
      const caption = captions.find(c => c.id === captionId);
      if (!caption) return;

      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'regenerate_script',
          scriptId: caption.id,
          currentContent: caption.content,
          scriptType: caption.type,
          rodzajSkryptu: caption.type,
          image: caption.image,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style, 
          avatarRecipient: settings.avatarRecipient
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Caption został zregenerowany",
        });
        loadCaptions();
      }
    } catch (error) {
      console.error('Error regenerating caption:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować caption",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Ładowanie captions...
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 shadow-platform">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Captions</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {captions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {captions.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak captions. Stwórz pierwszy caption!</p>
              </div>
            ) : (
              captions.map((caption) => (
                <div key={caption.id} className="group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 transition-all duration-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="platform-selected text-xs">
                        {caption.type}
                      </Badge>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(caption)}
                          className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                          title="Edytuj caption"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRegenerate(caption.id)}
                          disabled={loading}
                          className="hover:bg-secondary/10 hover:text-secondary h-8 w-8"
                          title="Zregeneruj caption"
                        >
                          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(caption.id)}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          title="Usuń caption"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-foreground mb-2 line-clamp-1">{caption.title}</h4>
                      
                      {caption.image ? (
                        <div className="mb-3 relative">
                          <img 
                            src={caption.image} 
                            alt={`Thumbnail for ${caption.title}`}
                            className="w-full h-32 object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      ) : (
                        <div className="mb-3 h-32 bg-gradient-to-br from-purple-100 to-pink-100 border border-form-container-border rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-12 h-12 text-purple-400 opacity-60" />
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {caption.content || "Brak treści caption"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(caption.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          draft
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

      <EditScriptModal
        script={selectedCaption}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCaption(null);
        }}
        onSave={handleSave}
      />
    </>
  );
};
