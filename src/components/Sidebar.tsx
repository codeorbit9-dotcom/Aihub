import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Trophy, 
  User, 
  Bell, 
  LogOut, 
  ShieldAlert,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Live Debates', path: '/debates' },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: User, label: 'Profile', path: `/profile/${user?.username}` },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  if (isAdmin) {
    navItems.push({ icon: ShieldAlert, label: 'Admin Panel', path: '/admin' });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={toggle}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 transform border-r border-white/10 bg-bg-dark transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-blue flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-primary-blue" />
              </div>
              <span className="text-xl font-bold tracking-tight text-sky-blue">AIGuardian</span>
            </Link>
            <button onClick={toggle} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all",
                  location.pathname === item.path 
                    ? "bg-sky-blue/10 text-sky-blue" 
                    : "text-text-primary/60 hover:bg-white/5 hover:text-text-primary"
                )}
                onClick={() => window.innerWidth < 1024 && toggle()}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-text-primary/60 transition-all hover:bg-white/5 hover:text-text-primary"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-danger-red transition-all hover:bg-danger-red/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
