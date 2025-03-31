import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@/types';

export function useSupabase() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null); // Use SupabaseUser type here
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and set the user
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes in auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // After Supabase signup, create user profile in Supabase
      if (data.user) {
        try {
          // Create user profile in Supabase
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id, 
                username: email.split('@')[0], // Simple username generation
                email,
                full_name: fullName,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (profileError) throw profileError;
          
          // Also register with our backend
          const response = await apiRequest('POST', '/api/auth/register', {
            username: email.split('@')[0],
            email,
            password,
            fullName
          });
          
          // Invalidate queries that might depend on authentication
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          
          toast({
            title: "Account created",
            description: "Welcome to Lukie's Fit Track! You can now log in.",
          });
        } catch (backendError: any) {
          // If our backend registration failed but Supabase worked, signout from Supabase
          await supabase.auth.signOut();
          throw new Error(backendError.message || "Failed to complete registration");
        }
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After Supabase login, update local state and proceed directly
      if (data.user) {
        // Register the login with backend but don't let it block the user experience
        try {
          await apiRequest('POST', '/api/auth/login', {
            email,
            password
          });
          // Invalidate auth query
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        } catch (backendError: any) {
          // Just log backend errors but don't make them block the login
          console.error("Backend login error:", backendError);
          // Still invalidate the auth query
          queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        }
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in to Lukie's Fit Track.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      await apiRequest('POST', '/api/auth/logout', {});
      queryClient.clear(); // Clear all query cache
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
}
