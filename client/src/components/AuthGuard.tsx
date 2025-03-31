import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSupabase } from '@/hooks/useSupabase';
import { useQuery } from '@tanstack/react-query';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useSupabase();
  const [location, setLocation] = useLocation();
  
  // Check if user is authenticated with our backend
  const { data: backendUser, isLoading: isBackendLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    enabled: !!user, // Only run if Supabase user exists
  });
  
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user && location !== '/') {
      setLocation('/');
    }
    
    // If not loading backend check and no backend user, redirect to login
    if (!isBackendLoading && !backendUser && user && location !== '/') {
      setLocation('/');
    }
  }, [user, loading, location, backendUser, isBackendLoading]);
  
  // Show loading indicator while checking auth
  if (loading || isBackendLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user or no backend user, don't render children
  if ((!user || !backendUser) && location !== '/') {
    return null;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
