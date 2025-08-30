import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PostsSection } from '@/components/sections/PostsSection';
import { ScriptsSection } from '@/components/sections/ScriptsSection';
import { RankingsSection } from '@/components/sections/RankingsSection';
import { StatsCards } from '@/components/sections/StatsCards';
import { CreateModal } from '@/components/modals/CreateModal';
import FloatingBackground from '@/components/FloatingBackground';
import { SettingsSection } from '@/components/SettingsSection';

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'posts':
        return <PostsSection />;
      case 'scripts':
        return <ScriptsSection />;
      case 'rankings':
        return <RankingsSection />;
      case 'settings':
        return <SettingsSection />;
      default: // dashboard
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Zarządzaj swoją zawartością w jednym miejscu</p>
            </div>
            <StatsCards />
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

export default Dashboard;