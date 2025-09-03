
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  accountSetupComplete: boolean | null;
  studioSetupComplete: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  completeAccountSetup: () => Promise<void>;
  completeStudioSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cleanup function to prevent auth limbo states
const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountSetupComplete, setAccountSetupComplete] = useState<boolean | null>(null);
  const [studioSetupComplete, setStudioSetupComplete] = useState<boolean | null>(null);

  // Fetch profile data when user changes
  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_setup_complete, onboarding_complete')
        .eq('id', userId)
        .single();
      
      setAccountSetupComplete(profile?.account_setup_complete ?? false);
      setStudioSetupComplete(profile?.onboarding_complete ?? false);
    } catch (error) {
      console.warn('Failed to fetch profile data:', error);
      setAccountSetupComplete(false);
      setStudioSetupComplete(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(() => {
            fetchProfileData(session.user.id);
          }, 0);
        } else {
          setAccountSetupComplete(null);
          setStudioSetupComplete(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfileData(session.user.id);
      } else {
        setAccountSetupComplete(null);
        setStudioSetupComplete(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // TODO: Re-enable rate limiting when RPC function is properly implemented
      // try {
      //   const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
      //     p_action_type: 'login',
      //     p_max_attempts: 5,
      //     p_window_minutes: 15
      //   });

      //   if (!rateLimitCheck) {
      //     return { error: { message: 'Too many login attempts. Please try again later.' } };
      //   }
      // } catch (rateLimitError) {
      //   console.warn('Rate limit check failed, proceeding with login:', rateLimitError);
      // }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed login attempt (without sensitive data)
        try {
          await supabase.rpc('log_security_event_enhanced', {
            p_event_type: 'login_failure',
            p_event_details: { 
              email_hash: btoa(email).substring(0, 10), // Obfuscated email
              error_type: error.message.includes('Invalid') ? 'invalid_credentials' : 'other'
            }
          });
        } catch (logError) {
          console.warn('Failed to log security event:', logError);
        }

        // Enhanced error handling without logging sensitive data
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password' } };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Please check your email and click the confirmation link' } };
        } else if (error.message.includes('Too many requests')) {
          return { error: { message: 'Too many login attempts. Please try again later' } };
        }
        return { error: { message: 'Login failed. Please try again.' } };
      }

      // Log successful login
      try {
        await supabase.rpc('log_security_event_enhanced', {
          p_event_type: 'login_success',
          p_event_details: { 
            email_hash: btoa(email).substring(0, 10) // Obfuscated email
          }
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined,
        }
      });

      if (error) {
        // Enhanced error handling without logging sensitive data
        if (error.message.includes('User already registered')) {
          return { error: { message: 'An account with this email already exists' } };
        } else if (error.message.includes('Password should be at least')) {
          return { error: { message: 'Password must be at least 6 characters long' } };
        } else if (error.message.includes('Invalid email')) {
          return { error: { message: 'Please enter a valid email address' } };
        }
      }

      return { error };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      cleanupAuthState();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      window.location.href = '/auth';
    } catch (error) {
      // Silent error handling for sign out
    }
  };

  const completeAccountSetup = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ account_setup_complete: true })
        .eq('id', user.id);
      
      setAccountSetupComplete(true);
    } catch (error) {
      console.warn('Failed to complete account setup:', error);
    }
  };

  const completeStudioSetup = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);
      
      setStudioSetupComplete(true);
    } catch (error) {
      console.warn('Failed to complete studio setup:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    accountSetupComplete,
    studioSetupComplete,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    completeAccountSetup,
    completeStudioSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
