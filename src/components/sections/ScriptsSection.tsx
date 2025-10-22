import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, RefreshCw, Trash2, Code, Search } from 'lucide-react';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { ImageModal } from '@/components/ui/ImageModal';
import { airtableService, Script } from '@/services/airtable';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

export const ScriptsSection: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [selectedImageAlt, setSelectedImageAlt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const { userId } = useSupabaseUser();

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const scriptsData = await airtableService.getScripts();
      setScripts(scriptsData);
    } catch (error) {
      console.error('Error loading scripts:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować skryptów",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (scriptId: string) => {
    try {
      const success = await airtableService.deleteScript(scriptId);
      if (success) {
        toast({
          title: "Sukces",
          description: "Skrypt został usunięty",
        });
        loadScripts();
      }
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

  const handleRegenerate = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://ricky-endotrophic-therese.ngrok-free.dev/api/regenerate-script', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ 
          user_id: userId || "{{user_id}}",
          źródło: 'regeneruj',
          postId: scriptId, 
          type: 'regenerate',
          currentTitle: script.title,
          currentContent: script.content,
          scriptType: script.type,
          rodzajSkryptu: script.type,
          image: script.image,
          voiceForPosts: settings.voiceForPosts,
          voiceForScripts: settings.voiceForScripts,
          style: settings.style, 
          avatarRecipient: settings.avatarRecipient,
          brandDescription: settings.brandDescription,
          language: settings.language
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt został zregenerowany",
        });
        loadScripts();
      }
    } catch (error) {
      console.error('Error regenerating script:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować skryptu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 shadow-platform">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Skrypty</span>
            <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
              {scripts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {scripts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak skryptów. Stwórz pierwszy skrypt!</p>
              </div>
            ) : (
              scripts.map((script) => (
                <div 
                  key={script.id} 
                  onClick={() => handleEdit(script)}
                  className="border border-form-container-border rounded-lg bg-card/50 hover:bg-card/80 hover:scale-105 transition-all duration-200 overflow-hidden cursor-pointer group"
                >
                  <div className="flex items-center justify-between p-3 border-b border-form-container-border">
                    <Badge variant="outline" className="platform-selected">
                      {script.type}
                    </Badge>
                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(script)}
                        className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerate(script.id)}
                        disabled={loading}
                        className="hover:bg-secondary/10 hover:text-secondary h-8 w-8"
                      >
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      </Button>
                      
                      {script.image && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleImageClick(script.image, `Thumbnail for ${script.title}`)}
                          className="hover:bg-blue-500/10 hover:text-blue-500 h-8 w-8"
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(script.id)}
                        className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-medium text-foreground mb-2 line-clamp-1">{script.title}</h4>
                    
                    {script.image ? (
                      <div className="mb-3 relative">
                        <img 
                          src={script.image} 
                          alt={`Thumbnail for ${script.title}`}
                          className="w-full aspect-square object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer h-32"
                          onClick={() => handleImageClick(script.image, `Thumbnail for ${script.title}`)}
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
                        {new Date(script.createdAt).toLocaleDateString('pl-PL')}
                      </span>
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
        onSave={async (updatedScript) => {
          const success = await airtableService.updateScript(updatedScript.id, updatedScript);
          if (success) {
            setScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
            toast({
              title: "Sukces",
              description: "Skrypt został zaktualizowany",
            });
          } else {
            toast({
              title: "Błąd",
              description: "Nie udało się zaktualizować skryptu",
              variant: "destructive",
            });
          }
          setIsEditModalOpen(false);
          setSelectedScript(null);
        }}
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