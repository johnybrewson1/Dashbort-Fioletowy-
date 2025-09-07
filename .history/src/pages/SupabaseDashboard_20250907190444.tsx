import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SupabasePostsSection } from '@/components/sections/SupabasePostsSection';
import { SupabaseScriptsSection } from '@/components/sections/SupabaseScriptsSection';
import { CaptionsSection } from '@/components/sections/CaptionsSection';
import { SupabaseRankingsSection } from '@/components/sections/SupabaseRankingsSection';
import { SupabaseStatsCards } from '@/components/sections/SupabaseStatsCards';
import { SupabaseSettingsSection } from '@/components/SupabaseSettingsSection';
import { CreateModal } from '@/components/modals/CreateModal';
import { TestDataCreator } from '@/components/TestDataCreator';
import FloatingBackground from '@/components/FloatingBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Shield, BarChart3 } from 'lucide-react';

const SupabaseDashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'posts':
        return <SupabasePostsSection />;
      case 'scripts':
        return <SupabaseScriptsSection />;
      case 'captions':
        return <CaptionsSection />;
      case 'rankings':
        return <SupabaseRankingsSection />;
      case 'settings':
        return <SupabaseSettingsSection />;
      default: // dashboard
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Supabase Dashboard</h1>
              <p className="text-muted-foreground">Zarządzaj swoją zawartością z pełną mocą Supabase</p>
            </div>

            {/* Migration Status Card */}
            <Card className="form-container border-form-container-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 shadow-platform">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <span>Status migracji Supabase</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    Aktywne
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/30">
                    <Shield className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">RLS Security</h3>
                      <p className="text-sm text-muted-foreground">Pełne zabezpieczenie danych</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/30">
                    <Zap className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">Real-time</h3>
                      <p className="text-sm text-muted-foreground">Synchronizacja na żywo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-card/30">
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-foreground">Analytics</h3>
                      <p className="text-sm text-muted-foreground">Zaawansowane statystyki</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SupabaseStatsCards />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen floating-background">
      <FloatingBackground />
      
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <div className="ml-64">
        <Header onCreateClick={() => setIsCreateModalOpen(true)} />
        
        <main className="p-6 pt-20">
          {renderMainContent()}
        </main>
      </div>

      <CreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default SupabaseDashboard;