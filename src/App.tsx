/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Menu } from 'lucide-react';

// Pages (to be created)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import DebatePage from './pages/DebatePage';
import ProfilePage from './pages/ProfilePage';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={
          <div className="flex min-h-screen bg-bg-dark">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 lg:ml-64">
              <header className="sticky top-0 z-30 flex h-16 items-center border-b border-white/10 bg-bg-dark/80 px-6 backdrop-blur-md lg:hidden">
                <button onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="h-6 w-6" />
                </button>
                <span className="ml-4 text-xl font-bold text-sky-blue">AIGuardian</span>
              </header>
              <main className="p-6">
                <div className="mx-auto max-w-7xl">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/debates" element={<div>Live Debates (Coming Soon)</div>} />
                    <Route path="/debate/:id" element={<DebatePage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/notifications" element={<div>Notifications (Coming Soon)</div>} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/debate/:id" element={<DebatePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={
          <div className="flex min-h-screen bg-bg-dark">
            <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 lg:ml-64">
              <main className="p-6">
                <Routes>
                  <Route path="/admin/*" element={<AdminPanel />} />
                </Routes>
              </main>
            </div>
          </div>
        }>
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
