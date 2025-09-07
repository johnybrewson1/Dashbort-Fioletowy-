import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MessageSquare, Plus } from 'lucide-react';
import { useSupabaseScripts } from '@/hooks/useSupabaseData';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import type { Script } from '@/lib/supabase';

export const CaptionsSection: React.FC = () => {
  const { scripts, loading, error, updateScript, deleteScript } = useSupabaseScripts();
  const [selectedCaption, setSelectedCaption] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { settings } = useSettings();

  // Filter scripts to show only captions
  const captions = useMemo(() => {
    return scripts.filter(script => 
      script.script_type === 'Instagram Captions' || 
      script.script_type === 'YouTube Captions' || 
      script.script_type === 'TikTok Captions'
    );
  }, [scripts]);

  const handleDelete = async (captionId: string) => {
    try {
      await deleteScript(captionId);
      toast({
        title: "Sukces",
        description: "Caption został usunięty",
      });
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
      await updateScript(updatedCaption.id, updatedCaption);
      toast({ title: "Sukces", description: "Caption został zaktualizowany" });
      setIsEditModalOpen(false);
      setSelectedCaption(null);
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować caption", variant: "destructive" });
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
                <div 
                  key={caption.id} 
                  className="group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleEdit(caption)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="platform-selected text-xs">
                        {caption.script_type}
                      </Badge>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(caption.id);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          title="Usuń caption"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-foreground mb-2 line-clamp-1">{caption.title}</h4>
                      
                      {caption.image_url ? (
                        <div className="mb-3 relative">
                          <img
                            src={caption.image_url}
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
