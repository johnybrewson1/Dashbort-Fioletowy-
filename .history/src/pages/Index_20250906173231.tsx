import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import FloatingBackground from '@/components/FloatingBackground';

const Index = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      // Auto redirect to dashboard if logged in
      if (user) {
        navigate('/dashboard');
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setLoading(false);
      
      // Auto redirect to dashboard if logged in
      if (currentUser) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="form-container max-w-4xl w-full rounded-2xl p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-tight">
            ContentHub
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed mb-8">
            Profesjonalna platforma do zarządzania treścią 🚀
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Twórz wirusowe posty, zarządzaj skryptami i analizuj rankingi w jednym miejscu.
          </p>
          
          <div className="space-y-4">
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-4 px-8 text-lg h-auto">
                Zaloguj się do Dashboard
              </Button>
            </Link>
            <div className="flex space-x-4 justify-center">
              <Link to="/dashboard">
                <Button variant="outline" className="py-3 px-6">
                  Airtable Dashboard
                </Button>
              </Link>
              <Link to="/supabase-dashboard">
                <Button variant="outline" className="py-3 px-6">
                  Supabase Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
