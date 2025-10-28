import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SupabasePostsSection } from '@/components/sections/SupabasePostsSection';
import { SupabaseScriptsSection } from '@/components/sections/SupabaseScriptsSection';
import { CaptionsSection } from '@/components/sections/CaptionsSection';
import { SupabaseRankingsSection } from '@/components/sections/SupabaseRankingsSection';
import { SupabaseStatsCards } from '@/components/sections/SupabaseStatsCards';
import { SupabaseSettingsSection } from '@/components/SupabaseSettingsSection';
import { CreateModal } from '@/components/modals/CreateModal';
import FloatingBackground from '@/components/FloatingBackground';
 

const SupabaseDashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Load active section from URL or localStorage on component mount
  useEffect(() => {
    const updateActiveSection = () => {
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
    };

    // Initial load
    updateActiveSection();

    // Listen for hash changes
    const handleHashChange = () => {
      updateActiveSection();
    };

    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Handle section change with URL and localStorage persistence
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Sync URL hash and localStorage whenever activeSection changes
  useEffect(() => {
    // Update URL hash (idempotent)
    if (window.location.hash.slice(1) !== activeSection) {
      window.location.hash = activeSection;
    }
    // Persist to localStorage
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

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

export default SupabaseDashboard;