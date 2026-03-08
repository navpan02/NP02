import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sessionToUser } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate from existing session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(sessionToUser(session));
      setLoading(false);
    });

    // Keep state in sync with Supabase auth events (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(sessionToUser(session))
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
