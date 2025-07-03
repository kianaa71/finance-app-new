
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createUser: (email: string, password: string, name: string, role: 'admin' | 'employee') => Promise<{ error: any }>;
  updateUser: (userId: string, name: string, role: 'admin' | 'employee') => Promise<{ error: any }>;
  deleteUser: (userId: string) => Promise<{ error: any }>;
  fetchUsers: () => Promise<{ data: Profile[] | null; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If no profile exists, create a default one
        if (error.code === 'PGRST116') {
          console.log('Creating default profile...');
          const { data: userData } = await supabase.auth.getUser();
          const defaultProfile = {
            id: userId,
            name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || 'User',
            email: userData.user?.email || '',
            role: userData.user?.email === 'junichiroalexandra27@gmail.com' ? 'admin' as const : 'employee' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to insert the profile
          try {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([defaultProfile])
              .select()
              .single();
              
            if (!insertError && newProfile) {
              console.log('Default profile created successfully:', newProfile);
              return newProfile;
            }
          } catch (insertErr) {
            console.error('Failed to create profile:', insertErr);
          }
          
          return defaultProfile;
        }
        
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception while fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    let loadingTimeout: NodeJS.Timeout;
    
    // Set loading timeout as fallback
    loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User logged in, fetching profile...');
          
          // Clear existing timeout
          if (loadingTimeout) clearTimeout(loadingTimeout);
          
          // Use setTimeout to prevent blocking
          setTimeout(async () => {
            try {
              const userProfile = await fetchProfile(session.user.id);
              setProfile(userProfile);
            } catch (error) {
              console.error('Error fetching profile:', error);
              setProfile(null);
            } finally {
              setLoading(false);
            }
          }, 100);
        } else {
          console.log('User logged out or no session, clearing profile...');
          setProfile(null);
          if (loadingTimeout) clearTimeout(loadingTimeout);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      }
      
      // Clear timeout and set loading to false
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLoading(false);
    }).catch((error) => {
      console.error('Session check error:', error);
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Signing up user:', email, name);
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      console.log('Sign up successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear local state first
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear localStorage manually
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Try to sign out, but don't throw error if session is missing
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.log('Sign out error (ignored):', signOutError);
        // Ignore errors, as we've already cleared local state
      }
      
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out exception:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      setProfile(null);
      setSession(null);
    }
  };

  const createUser = async (email: string, password: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Creating user via admin API:', { email, name, role });
      
      // Use admin API to create user without affecting current session
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true // Auto-confirm email to avoid email verification step
      });

      if (error) {
        console.error('Create user error:', error);
        return { error };
      }

      if (data.user) {
        // Create or update profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name,
            email,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError };
        }

        console.log('User created successfully:', data.user.email);
      }

      return { error: null };
    } catch (error) {
      console.error('Create user exception:', error);
      return { error };
    }
  };

  const updateUser = async (userId: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Updating user:', { userId, name, role });
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name, 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Update user error:', error);
        return { error };
      }

      console.log('User updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Update user exception:', error);
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Deactivating user:', userId);
      
      // Soft delete: update status to inactive instead of actually deleting
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Deactivate user error:', error);
        return { error };
      }

      console.log('User deactivated successfully');
      return { error: null };
    } catch (error) {
      console.error('Deactivate user exception:', error);
      return { error };
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching all users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('status', 'inactive') // Filter out inactive users
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch users error:', error);
        return { data: null, error };
      }

      console.log('Users fetched successfully:', data.length);
      return { data, error: null };
    } catch (error) {
      console.error('Fetch users exception:', error);
      return { data: null, error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      deleteUser,
      fetchUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
