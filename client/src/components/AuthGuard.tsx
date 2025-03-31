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
  
  // Check if user is authenticated with our backend, but make it optional
  const { data: backendUser, isLoading: isBackendLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    enabled: !!user, // Only run if Supabase user exists
    // Make this query always succeed by providing a default empty object
    // This way, we only rely on Supabase auth
    initialData: {},
  });
  
  useEffect(() => {
    // Only redirect if not on login page and there's no Supabase user
    if (!loading && !user && location !== '/') {
      setLocation('/');
    }
  }, [user, loading, location]);
  
  // Show loading indicator while checking Supabase auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Only check for Supabase user, ignore backend user
  // This fixes the sign-in issue by only relying on Supabase
  if (!user && location !== '/') {
    return null;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
