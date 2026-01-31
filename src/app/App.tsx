import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/app/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GradesProvider } from '@/contexts/GradesContext';
import { AppLayout } from '@/components/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GradesPage } from '@/pages/GradesPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { MailPage } from '@/pages/MailPage';
import { StudentInfoPage } from '@/pages/StudentInfoPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
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
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <GradesProvider>
          <AppContent />
          <Toaster />
        </GradesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
