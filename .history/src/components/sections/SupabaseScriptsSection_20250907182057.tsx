import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, RefreshCw, Trash2, Code, Plus } from 'lucide-react';
import { useSupabaseScripts } from '@/hooks/useSupabaseData';
import { EditScriptModal } from '@/components/modals/EditScriptModal';
import { toast } from '@/components/ui/use-toast';

export const SupabaseScriptsSection: React.FC = () => {
  const { scripts, loading, error, deleteScript, updateScript } = useSupabaseScripts();
  const [selectedScript, setSelectedScript] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Debug: log scripts data
  React.useEffect(() => {
    console.log('SupabaseScriptsSection - scripts:', scripts);
    console.log('SupabaseScriptsSection - loading:', loading);
    console.log('SupabaseScriptsSection - error:', error);
    if (scripts && scripts.length > 0) {
      console.log('First script data:', scripts[0]);
      console.log('First script image_url:', scripts[0].image_url);
    }
  }, [scripts, loading, error]);

  const handleDelete = async (scriptId: string) => {
    try {
      await deleteScript(scriptId);
      toast({
        title: "Sukces",
        description: "Skrypt został usunięty",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć skryptu",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async (scriptId: string) => {
    // This would trigger your Make.com webhook for regeneration
    try {
      const response = await fetch('https://hook.eu2.make.com/lxr7hxctm1s5olq53e29hl9dde9ppmyn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          źródło: 'regeneruj',
          scriptId, 
          type: 'regenerate_script_supabase'
        })
      });
      
      if (response.ok) {
        toast({
          title: "Sukces",
          description: "Skrypt zostanie zregenerowany",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zregenerować skryptu",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (script: any) => {
    setSelectedScript(script);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedScript: any) => {
    try {
      await updateScript(updatedScript.id, updatedScript);
      toast({
        title: "Sukces",
        description: "Skrypt został zaktualizowany",
      });
      setIsEditModalOpen(false);
      setSelectedScript(null);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować skryptu",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skrypty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2">Ładowanie skryptów...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skrypty
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p>Błąd ładowania skryptów: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="form-container border-form-container-border backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skrypty
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowy Skrypt
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    {script.script_type || 'Skrypt'}
                  </Badge>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(script)}
                      className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                      title="Edytuj skrypt"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerate(script.id)}
                      disabled={loading}
                      className="hover:bg-secondary/10 hover:text-secondary h-8 w-8"
                      title="Zregeneruj skrypt"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(script.id)}
                      className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      title="Usuń skrypt"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className="font-medium text-foreground mb-2 line-clamp-1">{script.title}</h4>
                  
                  {script.image_url ? (
                    <div className="mb-3 relative">
                      <img 
                        src={script.image_url} 
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
                      {new Date(script.created_at).toLocaleDateString('pl-PL')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {script.status || 'draft'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <EditScriptModal
        script={selectedScript}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedScript(null);
        }}
        onSave={handleSave}
      />
    </Card>
  );
};
