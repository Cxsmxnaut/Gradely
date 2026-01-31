import React, { createContext, useContext, useState, useEffect } from 'react';

interface GradelyUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

interface GradelySession {
  userId: string;
  username: string;
  email: string;
  displayName: string;
  loginTime: string;
  isGradelyUser: boolean;
}

interface GradelyAuthContextType {
  user: GradelyUser | null;
  session: GradelySession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<GradelyUser>) => void;
}

const GradelyAuthContext = createContext<GradelyAuthContextType | undefined>(undefined);

export function GradelyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GradelyUser | null>(null);
  const [session, setSession] = useState<GradelySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        // Check for existing Gradely session
        const storedSession = localStorage.getItem('gradely_session');
        const storedUser = localStorage.getItem('gradely_current_user');

        if (storedSession && storedUser) {
          const sessionData = JSON.parse(storedSession);
          const userData = JSON.parse(storedUser);

          // Validate session is still valid (basic check)
          if (sessionData.isGradelyUser && userData.id === sessionData.userId) {
            setSession(sessionData);
            setUser(userData);
            console.log('✅ Gradely session restored successfully');
          } else {
            console.warn('🔹 Invalid Gradely session data, clearing storage');
            clearGradelyAuth();
          }
        } else {
          console.log('🔹 No existing Gradely session found');
        }
      } catch (error) {
        console.warn('Failed to restore Gradely authentication:', error);
        clearGradelyAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const clearGradelyAuth = () => {
    localStorage.removeItem('gradely_session');
    localStorage.removeItem('gradely_current_user');
    setUser(null);
    setSession(null);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('gradely_users') || '{}');
      
      // Find user by username or email
      const foundUser = Object.values(existingUsers).find((u: any) => 
        u.username === username || u.email === username
      );

      if (!foundUser) {
        throw new Error('Invalid username/email or password');
      }

      const userData = foundUser as GradelyUser;
      
      // Create session
      const sessionData: GradelySession = {
        userId: userData.id,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        loginTime: new Date().toISOString(),
        isGradelyUser: true
      };

      // Store session and user data
      localStorage.setItem('gradely_session', JSON.stringify(sessionData));
      localStorage.setItem('gradely_current_user', JSON.stringify(userData));

      // Update state
      setSession(sessionData);
      setUser(userData);

      // Update last login
      const updatedUser = {
        ...userData,
        lastLogin: new Date().toISOString()
      };
      
      const updatedUsers = { ...existingUsers };
      updatedUsers[userData.id] = updatedUser;
      localStorage.setItem('gradely_users', JSON.stringify(updatedUsers));
      setUser(updatedUser);

      console.log('✅ Gradely login successful');
      return true;
    } catch (error) {
      console.error('Gradely login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, username: string, password: string, displayName: string): Promise<boolean> => {
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('gradely_users') || '{}');
      
      // Check if username or email already exists
      const userExists = Object.values(existingUsers).some((u: any) => 
        u.username === username || u.email === email
      );

      if (userExists) {
        throw new Error('Username or email already exists');
      }

      // Create new user
      const newUser: GradelyUser = {
        id: 'gradely_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        email,
        username,
        displayName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Store user (in a real app, we'd hash the password)
      existingUsers[newUser.id] = newUser;
      localStorage.setItem('gradely_users', JSON.stringify(existingUsers));

      // Create session
      const sessionData: GradelySession = {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        loginTime: new Date().toISOString(),
        isGradelyUser: true
      };

      // Store session and user data
      localStorage.setItem('gradely_session', JSON.stringify(sessionData));
      localStorage.setItem('gradely_current_user', JSON.stringify(newUser));

      // Update state
      setSession(sessionData);
      setUser(newUser);

      console.log('✅ Gradely signup successful');
      return true;
    } catch (error) {
      console.error('Gradely signup failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔹 Logging out from Gradely');
    clearGradelyAuth();
    
    // Navigate to login page
    window.location.href = '/gradely-login';
  };

  const updateUser = (updates: Partial<GradelyUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    
    // Update in users storage
    const existingUsers = JSON.parse(localStorage.getItem('gradely_users') || '{}');
    existingUsers[updatedUser.id] = updatedUser;
    localStorage.setItem('gradely_users', JSON.stringify(existingUsers));

    // Update current user storage
    localStorage.setItem('gradely_current_user', JSON.stringify(updatedUser));

    // Update state
    setUser(updatedUser);
    console.log('✅ Gradely user updated:', updatedUser);
  };

  return (
    <GradelyAuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading,
        login,
        signup,
        logout,
        updateUser
      }}
    >
      {children}
    </GradelyAuthContext.Provider>
  );
}

export function useGradelyAuth() {
  const context = useContext(GradelyAuthContext);
  if (context === undefined) {
    throw new Error('useGradelyAuth must be used within a GradelyAuthProvider');
  }
  return context;
}
