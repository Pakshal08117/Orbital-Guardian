import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { toast } from "@/components/ui/use-toast";

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading, session, refreshSession } = useAuth();
  const location = useLocation();

  // Check if session is expired and try to refresh it
  useEffect(() => {
    const checkSession = async () => {
      if (user && session) {
        // Check if token is about to expire (within 5 minutes)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const fiveMinutes = 5 * 60; // 5 minutes in seconds
        
        if (expiresAt && (expiresAt - now < fiveMinutes)) {
          console.log("Session about to expire, refreshing...");
          try {
            await refreshSession();
          } catch (error) {
            console.error("Failed to refresh session:", error);
            toast({
              title: "Session expired",
              description: "Please log in again",
              variant: "destructive"
            });
          }
        }
      }
    };
    
    checkSession();
  }, [user, session, refreshSession]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
