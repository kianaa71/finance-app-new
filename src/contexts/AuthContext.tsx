
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
  // TESTING MODE: Mock user data
  const mockUser = {
    id: 'test-admin-id',
    email: 'admin@test.com',
    user_metadata: { name: 'Test Admin' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User;

  const mockProfile = {
    id: 'test-admin-id',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const [user, setUser] = useState<User | null>(mockUser);
  const [profile, setProfile] = useState<Profile | null>(mockProfile);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

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
    // TESTING MODE: Skip auth setup
    console.log('Testing mode: Using mock data');
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
      
      const redirectUrl = `${window.location.origin}/`;
      
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
      
      // Create user via Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true
      });

      if (error) {
        console.error('Create user error:', error);
        return { error };
      }

      // Update user profile with role
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role, name })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Update profile error:', profileError);
          return { error: profileError };
        }
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
