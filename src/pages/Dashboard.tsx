import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SupabasePostsSection } from '@/components/sections/SupabasePostsSection';
import { ScriptsSection } from '@/components/sections/ScriptsSection';
import { RankingsSection } from '@/components/sections/RankingsSection';
import { CaptionsSection } from '@/components/sections/CaptionsSection';
import { StatsCards } from '@/components/sections/StatsCards';
import { CreateModal } from '@/components/modals/CreateModal';
import FloatingBackground from '@/components/FloatingBackground';
import { SettingsSection } from '@/components/SettingsSection';

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Load active section from URL or localStorage on component mount
  useEffect(() => {
    // First try to get from URL hash
    const hash = window.location.hash.slice(1); // Remove the # symbol
    
    if (hash && ['dashboard', 'posts', 'scripts', 'captions', 'rankings', 'settings'].includes(hash)) {
      setActiveSection(hash);
      return;
    }

    // Fallback to localStorage
    const savedSection = localStorage.getItem('activeSection');
    
    if (savedSection && ['dashboard', 'posts', 'scripts', 'captions', 'rankings', 'settings'].includes(savedSection)) {
      setActiveSection(savedSection);
      return;
    }

    // Default to dashboard
    setActiveSection('dashboard');
  }, []);

  // Listen for hash changes (when user navigates back/forward or changes URL directly)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && ['dashboard', 'posts', 'scripts', 'captions', 'rankings', 'settings'].includes(hash)) {
        setActiveSection(hash);
        localStorage.setItem('activeSection', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Handle section change with URL and localStorage persistence
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Update URL hash
    window.location.hash = section;
    
    // Save to localStorage as backup
    localStorage.setItem('activeSection', section);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'posts':
        return <SupabasePostsSection />;
      case 'scripts':
        return <ScriptsSection />;
      case 'captions':
        return <CaptionsSection />;
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
        activeSection={activeSection || 'dashboard'} 
        onSectionChange={handleSectionChange} 
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