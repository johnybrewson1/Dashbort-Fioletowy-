import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Video, TrendingUp, Users } from 'lucide-react';
import { airtableService } from '@/services/airtable';

export const StatsCards: React.FC = () => {
  const [stats, setStats] = useState([
    {
      title: 'Posty',
      value: '0',
      change: '+0%',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'Skrypty',
      value: '0',
      change: '+0%',
      icon: Video,
      gradient: 'from-green-500 to-emerald-400'
    },
    {
      title: 'Rankingi',
      value: '0',
      change: '+0%',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-400'
    }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [posts, scripts, rankings] = await Promise.all([
        airtableService.getPosts(),
        airtableService.getScripts(),
        airtableService.getRankings()
      ]);

      setStats(prev => [
        { ...prev[0], value: posts.length.toString() },
        { ...prev[1], value: scripts.length.toString() },
        { ...prev[2], value: rankings.length.toString() }
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
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