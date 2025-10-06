import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, TrendingUp, MessageSquare } from 'lucide-react';
import { useSupabaseStats } from '@/hooks/useSupabaseData';

export const SupabaseStatsCards: React.FC = () => {
  const { stats, loading } = useSupabaseStats();

  const statsCards = [
    {
      title: 'Posty',
      value: stats?.posts_count || '0',
      change: '+0%',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'Skrypty',
      value: stats?.scripts_count || '0',
      change: '+0%',
      icon: Video,
      gradient: 'from-green-500 to-emerald-400'
    },
    {
      title: 'Rankingi',
      value: stats?.rankings_count || '0',
      change: '+0%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-400'
    },
    {
      title: 'Captions',
      value: stats?.captions_count || '0',
      change: '+0%',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="form-container border-form-container-border backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="form-container border-form-container-border backdrop-blur-sm hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-platform`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-primary font-medium">
                {stat.change} z ostatniego miesiąca
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};