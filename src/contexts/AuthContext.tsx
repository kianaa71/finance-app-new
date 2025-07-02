
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
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('Creating basic profile for user:', userId);
          const { data: userData } = await supabase.auth.getUser();
          const basicProfile = {
            id: userId,
            name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || 'User',
            email: userData.user?.email || '',
            role: 'employee' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return basicProfile;
        }
        return null;
      }

      if (!data) {
        console.log('No profile found for user:', userId);
        // Create basic profile if none exists
        const { data: userData } = await supabase.auth.getUser();
        const basicProfile = {
          id: userId,
          name: userData.user?.user_metadata?.name || userData.user?.email?.split('@')[0] || 'User',
          email: userData.user?.email || '',
          role: 'employee' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return basicProfile;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception while fetching profile:', error);
      // Return basic profile on error to prevent infinite loading
      const basicProfile = {
        id: userId,
        name: 'User',
        email: '',
        role: 'employee' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return basicProfile;
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
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful');
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out exception:', error);
      throw error;
    }
  };

  const createUser = async (email: string, password: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Creating user:', { email, name, role });
      
      // Use regular signup instead of admin.createUser
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('Create user error:', error);
        return { error };
      }

      // Update role in profiles table if user was created
      if (data.user) {
        // Wait a bit for the trigger to create the profile
        setTimeout(async () => {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role, name })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Update profile error:', profileError);
          }
        }, 1000);
      }

      console.log('User created successfully:', data.user?.email);
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
      console.log('Deleting user:', userId);
      
      // Delete user via Supabase Auth Admin
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        console.error('Delete user error:', error);
        return { error };
      }

      console.log('User deleted successfully');
      return { error: null };
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
