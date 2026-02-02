import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  Mail,
  User,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Home,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/app/components/ui/button';
import { useGradelyAuth } from '@/contexts/GradelyAuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useGradelyAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'grades', label: 'Grades', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'student-info', label: 'Student Info', icon: User },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h1 className="text-2xl font-bold text-primary">Gradely</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {user?.user_metadata?.display_name || user?.email || 'Guest'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-white'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-5 mr-3" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="size-5 mr-3" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={logout}
            >
              <LogOut className="size-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.user_metadata?.display_name || user?.email || 'User'}</p>
              </div>
              {user?.user_metadata?.profile_picture_url ? (
                <img
                  src={user.user_metadata.profile_picture_url}
                  alt="Profile"
                  className="size-10 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
        
        {/* Legal Footer */}
        <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div className="text-center text-xs text-neutral-600 dark:text-neutral-400">
            <p>
              Gradely is not affiliated with, endorsed by, or connected to any school or educational institution.
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
