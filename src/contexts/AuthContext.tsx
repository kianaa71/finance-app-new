
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
  // TEMPORARY: Mock user dan profile untuk testing tanpa login
  const mockUser: User = {
    id: 'mock-admin-id',
    email: 'admin@financeapp.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    role: 'authenticated'
  } as User;

  const mockProfile: Profile = {
    id: 'mock-admin-id',
    name: 'Administrator (Test Mode)',
    email: 'admin@financeapp.com',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser
  };

  // Set mock data sebagai default
  const [user, setUser] = useState<User | null>(mockUser);
  const [profile, setProfile] = useState<Profile | null>(mockProfile);
  const [session, setSession] = useState<Session | null>(mockSession);
  const [loading, setLoading] = useState(false); // Set false agar tidak ada loading

  // Comment out real auth logic untuk sementara
  /*
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
  */

  // Mock functions untuk testing
  const signIn = async (email: string, password: string) => {
    console.log('Mock signIn called with:', email);
    // Return success untuk testing
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Mock signUp called with:', email, name);
    return { error: null };
  };

  const signOut = async () => {
    console.log('Mock signOut called');
    // Tidak melakukan apa-apa untuk testing
  };

  const createUser = async (email: string, password: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Mock createUser called:', { email, name, role });
      
      // Mock success response
      return { error: null };
    } catch (error) {
      console.error('Mock createUser error:', error);
      return { error };
    }
  };

  const updateUser = async (userId: string, name: string, role: 'admin' | 'employee') => {
    try {
      console.log('Mock updateUser called:', { userId, name, role });
      
      // Mock success response
      return { error: null };
    } catch (error) {
      console.error('Mock updateUser error:', error);
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Mock deleteUser called:', userId);
      
      // Mock success response
      return { error: null };
    } catch (error) {
      console.error('Mock deleteUser error:', error);
      return { error };
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('Mock fetchUsers called');
      
      // Return mock users data
      const mockUsers: Profile[] = [
        {
          id: 'mock-admin-id',
          name: 'Administrator (Test Mode)',
          email: 'admin@financeapp.com',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-employee-1',
          name: 'John Doe (Test)',
          email: 'john@financeapp.com',
          role: 'employee',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-employee-2',
          name: 'Jane Smith (Test)',
          email: 'jane@financeapp.com',
          role: 'employee',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return { data: mockUsers, error: null };
    } catch (error) {
      console.error('Mock fetchUsers error:', error);
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
