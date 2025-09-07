import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useSupabaseRankings } from '@/hooks/useSupabaseData';
import { CreateFromRankingModal } from '@/components/modals/CreateFromRankingModal';
import { toast } from '@/components/ui/use-toast';
import type { Ranking } from '@/lib/supabase';

export const SupabaseRankingsSection: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const rankingsData = await airtableService.getRankings();
      setRankings(rankingsData);
      setError(null);
    } catch (error) {
      console.error('Error loading rankings:', error);
      setError('Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  const handleDelete = async (rankingId: string) => {
    try {
      const success = await airtableService.deleteRanking(rankingId);
      if (success) {
        toast({
          title: "Sukces",
          description: "Ranking został usunięty",
        });
        loadRankings();
      }
    } catch (error) {
      console.error('Error deleting ranking:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć rankingu",
        variant: "destructive",
      });
    }
  };

  const handleCreateFrom = (ranking: Ranking) => {
    setSelectedRanking(ranking);
    setIsCreateModalOpen(true);
  };

  if (loading) {
    return (
      <Card className="form-container border-form-container-border backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Ładowanie rankingów...
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
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-foreground">Rankingi</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              {rankings.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak rankingów. Stwórz pierwszy ranking!</p>
              </div>
            ) : (
              rankings.map((ranking) => (
                <div key={ranking.id} className="flex items-center justify-between p-4 border border-form-container-border rounded-lg bg-card/50 hover:bg-card/80 transition-all duration-200">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {ranking.thumbnailUrl ? (
                        <img 
                          src={ranking.thumbnailUrl} 
                          alt={`Thumbnail for ${ranking.title}`}
                          className="w-20 h-20 object-cover rounded-lg border border-form-container-border shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 border border-form-container-border rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{ranking.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        Ratio: {ranking.ratio}% 
                        {ranking.thumbnailUrl && (
                          <a 
                            href={ranking.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline inline-flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Zobacz film</span>
                          </a>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={ranking.shouldCreateContent ? "default" : "secondary"} className="platform-selected">
                          {ranking.shouldCreateContent ? 'Gotowy do użycia' : 'W analizie'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ranking.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateFrom(ranking)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Stwórz z
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(ranking.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <CreateFromRankingModal
        ranking={selectedRanking}
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedRanking(null);
        }}
      />
    </>
  );
};