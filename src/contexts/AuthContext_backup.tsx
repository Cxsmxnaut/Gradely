import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { useGradelyAuth } from './GradelyAuthContext';
import { 
  getStudentVueCredentials, 
  saveStudentVueCredentials 
} from '@/lib/studentVueCredentials';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { user: gradelyUser } = useGradelyAuth();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        if (!gradelyUser) {
          setIsLoading(false);
          return;
        }

        console.log('🔹 Loading StudentVUE credentials from server for user:', gradelyUser.id);
        
        // Try to get credentials from server first
        const serverCredentials = await getStudentVueCredentials(gradelyUser.id);
        
        if (serverCredentials) {
          console.log('✅ Found StudentVUE credentials on server');
          
          // Restore credentials for API calls
          setCredentials({
            districtUrl: serverCredentials.district_url,
            username: serverCredentials.username,
            password: serverCredentials.password
          });
          
          // Initialize student account
          const { StudentAccount } = await import('../lib/synergy');
          const { acc } = await import('../lib/account.svelte');
          
          const studentAccount = new StudentAccount(
            serverCredentials.district_url, 
            serverCredentials.username, 
            serverCredentials.password
          );
          acc.studentAccount = studentAccount;
          
          // Try to fetch fresh student data
          try {
            const { fetchStudent } = await import('../adapters/dataService');
            const adaptedStudent = await fetchStudent();
            console.log('✅ Fresh student data fetched using server credentials:', adaptedStudent);
            
            // Check for manual student info overrides
            const manualStudentInfo = localStorage.getItem('manual_student_info');
            let manualInfo: Record<string, string> = {};
            if (manualStudentInfo) {
              try {
                manualInfo = JSON.parse(manualStudentInfo);
                console.log('📝 Loaded manual student info:', manualInfo);
              } catch (e) {
                console.warn('Failed to parse manual student info:', e);
              }
            }
            
            // Apply manual overrides if they exist
            if (Object.keys(manualInfo).length > 0) {
              Object.entries(manualInfo).forEach(([key, value]) => {
                if (key in adaptedStudent) {
                  (adaptedStudent as any)[key] = value;
                }
              });
              console.log('✅ Applied manual student info overrides');
            }
            
            setUser(adaptedStudent);
          } catch (fetchError) {
            console.error('Failed to fetch fresh student data:', fetchError);
            // Still set user with basic info from credentials
            setUser({
              username: serverCredentials.username,
              studentId: serverCredentials.username,
              firstName: '',
              lastName: '',
              grade: '',
              school: ''
            });
            }
            
            console.log('✅ Authentication session restored successfully');
          } else {
            console.warn('🔹 Invalid session data, clearing storage');
            clearAuthStorage();
          }
        } else {
          console.log('🔹 No existing authentication session found');
        }
      } catch (error) {
        console.warn('Failed to restore authentication session:', error);
        clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuth();
  }, []);

  // Helper function to clear all auth storage
  const clearAuthStorage = () => {
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('district_domain');
    localStorage.removeItem('savedAuth'); // Clear old format
  };

  const login = async (districtUrl: string, username: string, password: string, remember: boolean) => {
    try {
      // Store credentials for API calls
      const creds = { districtUrl, username, password };
      setCredentials(creds);
      
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
        
        // Fetch real student data
        let studentInfo;
        try {
          const { fetchStudent } = await import('../adapters/dataService');
          const adaptedStudent = await fetchStudent();
          console.log('✅ Real student data fetched:', adaptedStudent);
          
          // Check for manual student info overrides
          const manualStudentInfo = localStorage.getItem('manual_student_info');
          let manualInfo: Record<string, string> = {};
          if (manualStudentInfo) {
            try {
              manualInfo = JSON.parse(manualStudentInfo);
              console.log('📝 Loaded manual student info during login:', manualInfo);
            } catch (e) {
              console.warn('Failed to parse manual student info:', e);
            }
          }
          
          // Convert AdaptedStudent to Student type with all required fields
          studentInfo = {
            id: adaptedStudent.studentId || 'REAL_USER',
            name: adaptedStudent.name || 'Student',
            gradeLevel: adaptedStudent.gradeLevel || 'Loading...',
            email: manualInfo.email || '',
            phone: manualInfo.phone || '',
            studentId: adaptedStudent.studentId || username,
            schoolName: manualInfo.schoolName || adaptedStudent.schoolName || 'Loading...',
            counselor: manualInfo.counselor || adaptedStudent.counselor || '',
            parentName: manualInfo.parentName || '',
            parentEmail: manualInfo.parentEmail || '',
            parentPhone: manualInfo.parentPhone || '',
            photo: adaptedStudent.photo || ''
          };
        } catch (studentError) {
          console.warn('Failed to fetch student data, using placeholders:', studentError);
          // Fallback to placeholder data
          studentInfo = {
            id: 'REAL_USER',
            name: 'Student',
            gradeLevel: 'Loading...',
            email: '',
            phone: '',
            studentId: username,
            schoolName: 'Loading...',
            counselor: '',
            parentName: '',
            parentEmail: '',
            parentPhone: '',
            photo: ''
          };
        }
        
        // Create user object for the UI
        const user = {
          username,
          password,
          studentInfo
        };
        
        // Persist authentication session
        const session = {
          isValid: true,
          password: password,
          loginTime: new Date().toISOString(),
          remember: remember
        };
        
        // Store using required keys
        localStorage.setItem('auth_session', JSON.stringify(session));
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('district_domain', districtUrl);
        
        // Also maintain backward compatibility
        if (remember) {
          localStorage.setItem('savedAuth', JSON.stringify(creds));
        } else {
          localStorage.removeItem('savedAuth');
        }
        
        setUser(user);
        console.log('✅ Authentication successful and persisted');
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
    
    // Clear all authentication storage
    clearAuthStorage();
    
    // Clear grades cache on logout
    localStorage.removeItem('gradely_grades_cache');
    localStorage.removeItem('gradely_grades_cache_timestamp');
    console.log('🗑️ All auth data and grades cache cleared on logout');
    
    // Navigate to Gradely login page
    window.history.pushState({}, '', '/login');
    
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
        isLoading,
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
