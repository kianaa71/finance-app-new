
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
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
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User logged in, fetching profile from database...');
          const userProfile = await fetchProfile(session.user.id);
          
          if (userProfile) {
            setProfile(userProfile);
            console.log('Profile set successfully:', userProfile);
          } else {
            console.log('Profile not found in database');
            setProfile(null);
          }
        } else {
          console.log('User logged out, clearing profile...');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        if (userProfile) {
          setProfile(userProfile);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in response:', { data: data?.user?.email, error });
      
      if (error) {
        console.error('Sign in error:', error);
      }
      
      return { error };
    } catch (err) {
      console.error('Sign in exception:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Attempting to sign up with:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: name
        }
      }
    });
    
    console.log('Sign up response:', { error });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const createUser = async (email: string, password: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Creating new user:', { email, name, role });
      
      // Admin creates new user via auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { error: authError };
      }

      if (authData.user) {
        // Update the profile with the correct role
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name,
            role,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          return { error: profileError };
        }
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
      }

      return { error };
    } catch (error) {
      console.error('Update user exception:', error);
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      
      // Delete from profiles first (will cascade to auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Delete user error:', error);
      }

      return { error };
    } catch (error) {
      console.error('Delete user exception:', error);
      return { error };
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Fetching all users...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch users error:', error);
      }

      return { data, error };
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
