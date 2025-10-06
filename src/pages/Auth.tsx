import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Test connection to Supabase
  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
      console.log('Supabase connection test:', { data, error });
      return !error;
    } catch (error) {
      console.error('Supabase connection failed:', error);
      return false;
    }
  };

  React.useEffect(() => {
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let data, error;
      
      if (isLogin) {
        // Logowanie
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = result.data;
        error = result.error;
      } else {
        // Rejestracja
        const result = await supabase.auth.signUp({
          email,
          password,
        });
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        toast({
          title: isLogin ? "Błąd logowania" : "Błąd rejestracji",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (isLogin) {
          toast({
            title: "Sukces",
            description: "Zalogowano pomyślnie!",
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Sukces",
            description: "Konto zostało utworzone! Sprawdź email w celu potwierdzenia.",
          });
          setIsLogin(true); // Przełącz na tryb logowania
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="ring">
        <i style={{'--clr': '#00ffff'}}></i>
        <i style={{'--clr': '#ff69b4'}}></i>
        <i style={{'--clr': '#8b5cf6'}}></i>
        <div className="login">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            ContentHub
          </h2>
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="inputBx">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 bg-transparent border-2 border-white rounded-full text-white text-lg placeholder-white/75 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div className="inputBx">
              <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 bg-transparent border-2 border-white rounded-full text-white text-lg placeholder-white/75 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div className="inputBx">
              <input
                type="submit"
                value={loading ? (isLogin ? 'Logowanie...' : 'Rejestracja...') : (isLogin ? 'Zaloguj się' : 'Zarejestruj się')}
                disabled={loading}
                className="w-full px-5 py-3 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 border-none rounded-full text-white text-lg font-semibold cursor-pointer hover:from-cyan-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/75 hover:text-white text-sm underline transition-colors"
              >
                {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;