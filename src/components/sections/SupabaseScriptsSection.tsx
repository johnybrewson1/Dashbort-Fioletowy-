import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Code, Plus, Search } from 'lucide-react';
import { useSupabaseScripts } from '@/hooks/useSupabaseData';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { ImageModal } from '@/components/ui/ImageModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { formatDateTime } from '@/lib/dateUtils';
import type { Script } from '@/lib/supabase';

export const SupabaseScriptsSection: React.FC = () => {
  const { scripts, loading, error, updateScript, deleteScript } = useSupabaseScripts();
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const { settings } = useSettings();

  // Filter scripts to exclude captions (captions should only appear in CaptionsSection)
  const filteredScripts = useMemo(() => {
    const filtered = scripts.filter(script => 
      script.script_type !== 'Instagram Captions' && 
      script.script_type !== 'YouTube Captions' && 
      script.script_type !== 'TikTok Captions'
    );
    
    // Debug: Log scripts and their image_url
    console.log('All scripts:', scripts);
    console.log('Filtered scripts:', filtered);
    filtered.forEach(script => {
      console.log(`Script "${script.title}": image_url = "${script.image_url}"`);
    });
    
    return filtered;
  }, [scripts]);

  const handleDelete = async (scriptId: string) => {
    try {
      await deleteScript(scriptId);
      toast({
        title: "Sukces",
        description: "Skrypt został usunięty",
      });
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć skryptu",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (imageUrl: string, alt: string) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageAlt(alt);
    setIsImageModalOpen(true);
  };

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedScript: Script) => {
    try {
      await updateScript(updatedScript.id, updatedScript);
      toast({ title: "Sukces", description: "Skrypt został zaktualizowany" });
      setIsEditModalOpen(false);
      setSelectedScript(null);
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zaktualizować skryptu", variant: "destructive" });
    }
  };


  if (loading) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Ładowanie skryptów...
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
            {filteredScripts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak skryptów. Stwórz pierwszy skrypt!</p>
              </div>
            ) : (
              filteredScripts.map((script) => (
                <div 
                  key={script.id} 
                  className="group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleEdit(script)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="platform-selected text-xs">
                        {script.script_type}
                      </Badge>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {script.image_url && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(script.image_url, `Thumbnail for ${script.title}`);
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
                            handleDelete(script.id);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          title="Usuń skrypt"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h4 className="font-medium text-foreground mb-2 line-clamp-1">{script.title}</h4>
                      
                      {(script.image_url || (script as any).image_url_text || (script as any).thumbnail_url || (script as any).thumbnailUrl || (script as any).imageUrl) ? (
                        <div className="mb-3 relative">
                          <img
                            src={(script.image_url || (script as any).image_url_text || (script as any).thumbnail_url || (script as any).thumbnailUrl || (script as any).imageUrl) as string}
                            alt={`Thumbnail for ${script.title}`}
                            className="w-full aspect-square object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-32"
                            onClick={() => handleImageClick((script.image_url || (script as any).image_url_text || (script as any).thumbnail_url || (script as any).thumbnailUrl || (script as any).imageUrl) as string, `Thumbnail for ${script.title}`)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      ) : (
                        <div className="mb-3 aspect-square bg-gradient-to-br from-green-100 to-emerald-100 border border-form-container-border rounded-lg flex items-center justify-center h-32">
                          <Code className="w-8 h-8 text-green-400 opacity-60" />
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {script.content || "Brak treści skryptu"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Utworzono: {formatDateTime(script.created_at)}
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
        script={selectedScript}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedScript(null);
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