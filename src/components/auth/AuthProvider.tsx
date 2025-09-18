import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  refreshSession: async () => {}
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
        
        // Clear all auth-related storage
        localStorage.removeItem('orbital-sentinel-auth-token');
        localStorage.removeItem('orbital-sentinel-user-data');
        
        // Clear session state
        setSession(null);
        setUser(null);
        setLoading(false);
        
        // Redirect to auth with session expired parameter
        window.location.href = "/auth?session=expired";
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      } else {
        // No session returned but no error either - handle as logged out
        setSession(null);
        setUser(null);
        // Redirect without error message since this might be normal logout
        window.location.href = "/auth";
      }
    } catch (e) {
      console.error("Session refresh exception:", e);
      // Handle exceptions by clearing session and redirecting
      localStorage.removeItem('orbital-sentinel-auth-token');
      localStorage.removeItem('orbital-sentinel-user-data');
      setSession(null);
      setUser(null);
      setLoading(false);
      window.location.href = "/auth?session=expired";
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('Auth state changed:', event);
      
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED_ERROR') {
        console.warn('Token refresh failed - clearing session');
        // Clear session and redirect to login
        setSession(null);
        setUser(null);
        setLoading(false);
        // Redirect to auth page with error message
        window.location.href = '/auth?error=session_expired';
        return;
      }
      
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        // Clear any cached data if needed
        localStorage.removeItem('orbital-sentinel-user-data');
      } else if (event === 'USER_UPDATED') {
        console.log('User profile updated');
      }
    });

    // Initialize AFTER listener is set up
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Get session error:", error);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
