import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/app/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GradelyAuthProvider, useGradelyAuth } from '@/contexts/GradelyAuthContext';
import { GradesProvider } from '@/contexts/GradesContext';
import { AppLayout } from '@/components/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { GradelyLoginPage } from '@/pages/GradelyLoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GradesPage } from '@/pages/GradesPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { MailPage } from '@/pages/MailPage';
import { StudentInfoPage } from '@/pages/StudentInfoPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAuthenticated: isGradelyAuthenticated, isLoading: isGradelyLoading } = useGradelyAuth();
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/' || path === '/landing') return 'landing';
    if (path === '/gradely-login') return 'gradely-login';
    if (path.startsWith('/')) return path.slice(1);
    return 'dashboard';
  });
  const [showLandingPage, setShowLandingPage] = useState(() => {
    return window.location.pathname === '/' || window.location.pathname === '/landing';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check if either authentication system is authenticated
  const isAnyAuthenticated = isAuthenticated || isGradelyAuthenticated;
  const isAnyLoading = isLoading || isGradelyLoading;

  useEffect(() => {
    const handlePopState = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        const path = window.location.pathname;
        if (path === '/' || path === '/landing') {
          setShowLandingPage(true);
        } else {
          setShowLandingPage(false);
          const page = path.slice(1) || 'dashboard';
          setCurrentPage(page);
        }
        setTimeout(() => setIsTransitioning(false), 1);
      }, 1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (page: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setShowLandingPage(false);
      window.history.pushState({}, '', `/${page}`);
      setTimeout(() => setIsTransitioning(false), 1);
    }, 1);
  };

  // Show loading state while checking authentication
  if (isAnyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showLandingPage) {
    return (
      <div className={`transition-opacity duration-75 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <LandingPage onGetStarted={() => navigateToPage('login')} />
      </div>
    );
  }

  // Show Gradely login page if specifically requested
  if (currentPage === 'gradely-login') {
    return (
      <div className={`transition-opacity duration-75 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <GradelyLoginPage />
      </div>
    );
  }

  if (!isAnyAuthenticated) {
    return (
      <div className={`transition-opacity duration-75 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <LoginPage />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'grades':
        return <GradesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'documents':
        return <DocumentsPage />;
      case 'mail':
        return <MailPage />;
      case 'student-info':
        return <StudentInfoPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <AppLayout currentPage={currentPage} onNavigate={navigateToPage}>
        {renderPage()}
      </AppLayout>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GradelyAuthProvider>
          <GradesProvider>
            <AppContent />
            <Toaster />
          </GradesProvider>
        </GradelyAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
