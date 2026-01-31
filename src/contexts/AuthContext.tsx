import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  credentials: {
    districtUrl: string;
    username: string;
    password: string;
  } | null;
  login: (districtUrl: string, username: string, password: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState<{
    districtUrl: string;
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    // Check if user was remembered
    const savedAuth = localStorage.getItem('savedAuth');
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setCredentials(auth);
        
        // Restore the student account if credentials exist
        if (auth.districtUrl && auth.username && auth.password) {
          import('../lib/synergy').then(({ StudentAccount }) => {
            import('../lib/account.svelte').then(({ acc }) => {
              const studentAccount = new StudentAccount(auth.districtUrl, auth.username, auth.password);
              acc.studentAccount = studentAccount;
            });
          });
        }
        
        setUser(mockUser); // Will be replaced with real user data
      } catch {
        localStorage.removeItem('savedAuth');
      }
    }
  }, []);

  const login = async (districtUrl: string, username: string, password: string, remember: boolean) => {
    try {
      // Store credentials for API calls
      const creds = { districtUrl, username, password };
      setCredentials(creds);
      
      if (remember) {
        localStorage.setItem('savedAuth', JSON.stringify(creds));
      } else {
        localStorage.removeItem('savedAuth');
      }
      
      // Real authentication with StudentVUE backend
      try {
        // Import StudentAccount class and acc object
        const { StudentAccount } = await import('../lib/synergy');
        const { acc } = await import('../lib/account.svelte');
        
        // Create student account with provided credentials
        const studentAccount = new StudentAccount(districtUrl, username, password);
        
        // Test authentication by checking login
        await studentAccount.checkLogin();
        
        // Store the authenticated account in the global acc object
        acc.studentAccount = studentAccount;
        
        // If successful, create user object for the UI
        const user = {
          username,
          password,
          studentInfo: {
            id: 'REAL_USER',
            name: 'Student', // Will be updated with real data
            gradeLevel: 'Loading...',
            email: '',
            phone: '',
            studentId: username,
            schoolName: 'Loading...',
            counselor: '',
            parentName: '',
            parentEmail: '',
            parentPhone: '',
          }
        };
        
        setUser(user);
        return true;
        
      } catch (error) {
        console.error('Authentication failed:', error);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCredentials(null);
    localStorage.removeItem('savedAuth');
    
    // Clear the student account from the global acc object
    import('../lib/account.svelte').then(({ acc }) => {
      acc.studentAccount = undefined;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        credentials,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
