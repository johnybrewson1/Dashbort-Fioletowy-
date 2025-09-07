import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Code, Plus } from 'lucide-react';
import { airtableService, Script } from '@/services/airtable';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { toast } from '@/components/ui/use-toast';
import { useSettings } from '@/hooks/useSettings';

export const SupabaseScriptsSection: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { settings } = useSettings();

  const loadScripts = async () => {
    try {
      setLoading(true);
      const scriptsData = await airtableService.getScripts();
      setScripts(scriptsData);
      setError(null);
    } catch (error) {
      console.error('Error loading scripts:', error);
      setError('Failed to load scripts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScripts();
  }, []);

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

  const handleEdit = (script: Script) => {
    setSelectedScript(script);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedScript: Script) => {
    try {
      const success = await airtableService.updateScript(updatedScript.id, updatedScript);
      if (success) {
        toast({ title: "Sukces", description: "Skrypt został zaktualizowany" });
        setIsEditModalOpen(false);
        setSelectedScript(null);
        loadScripts();
      }
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
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 shadow-platform">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Skrypty</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {scripts.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak skryptów. Stwórz pierwszy skrypt!</p>
              </div>
            ) : (
              scripts.map((script) => (
                <div 
                  key={script.id} 
                  className="group relative bg-card/50 border border-form-container-border rounded-lg hover:bg-card/80 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                  onClick={() => handleEdit(script)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="platform-selected text-xs">
                        {script.type}
                      </Badge>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                      
                      {script.image ? (
                        <div className="mb-3 relative">
                          <img 
                            src={script.image} 
                            alt={`Thumbnail for ${script.title}`}
                            className="w-full h-32 object-cover rounded-lg border border-form-container-border shadow-sm hover:shadow-md transition-shadow duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      ) : (
                        <div className="mb-3 h-32 bg-gradient-to-br from-green-100 to-emerald-100 border border-form-container-border rounded-lg flex items-center justify-center">
                          <Code className="w-12 h-12 text-green-400 opacity-60" />
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {script.content || "Brak treści skryptu"}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(script.createdAt).toLocaleDateString('pl-PL')}
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
    </>
  );
};